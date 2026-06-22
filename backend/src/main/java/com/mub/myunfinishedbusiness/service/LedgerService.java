package com.mub.myunfinishedbusiness.service;

import com.mub.myunfinishedbusiness.dto.DailyLedgerRequest;
import com.mub.myunfinishedbusiness.dto.DailyLedgerResponse;
import com.mub.myunfinishedbusiness.dto.StockSummaryResponse;
import com.mub.myunfinishedbusiness.entity.DailyLedger;
import com.mub.myunfinishedbusiness.entity.User;
import com.mub.myunfinishedbusiness.repository.DailyLedgerRepository;
import com.mub.myunfinishedbusiness.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private static final int SMA_PERIOD = 7;

    private final DailyLedgerRepository ledgerRepository;
    private final UserRepository userRepository;

    // ─── Helper: get the authenticated user ─────────────────────────────────
    private User currentUser() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────
    @Transactional
    public DailyLedgerResponse createEntry(DailyLedgerRequest req) {
        User user = currentUser();

        if (ledgerRepository.findByUserAndEntryDate(user, req.getEntryDate()).isPresent()) {
            throw new IllegalArgumentException(
                "An entry for " + req.getEntryDate() + " already exists."
            );
        }

        BigDecimal percentChange = calculatePercentChange(user, req.getEntryDate(), req.getClosingPrice());

        DailyLedger ledger = DailyLedger.builder()
            .user(user)
            .entryDate(req.getEntryDate())
            .closingPrice(req.getClosingPrice())
            .percentageChange(percentChange)
            .summaryText(req.getSummaryText())
            .completedDisciplines(req.getCompletedDisciplines())
            .tags(req.getTags())
            .build();

        DailyLedger saved = ledgerRepository.save(ledger);
        recalculateNextEntryPercentChange(user, saved.getEntryDate());
        return DailyLedgerResponse.from(saved);
    }

    // ─── READ ALL ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<DailyLedgerResponse> getAllEntries() {
        User user = currentUser();
        return ledgerRepository.findByUserOrderByEntryDateAsc(user)
            .stream()
            .map(DailyLedgerResponse::from)
            .toList();
    }

    // ─── READ BY DATE RANGE ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<DailyLedgerResponse> getEntriesByRange(LocalDate start, LocalDate end) {
        User user = currentUser();
        return ledgerRepository
            .findByUserAndEntryDateBetweenOrderByEntryDateAsc(user, start, end)
            .stream()
            .map(DailyLedgerResponse::from)
            .toList();
    }

    // ─── READ ONE ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public DailyLedgerResponse getEntry(UUID id) {
        User user = currentUser();
        DailyLedger ledger = ledgerRepository.findById(id)
            .filter(l -> l.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new EntityNotFoundException("Ledger entry not found: " + id));
        return DailyLedgerResponse.from(ledger);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────
    @Transactional
    public DailyLedgerResponse updateEntry(UUID id, DailyLedgerRequest req) {
        User user = currentUser();
        DailyLedger ledger = ledgerRepository.findById(id)
            .filter(l -> l.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new EntityNotFoundException("Ledger entry not found: " + id));

        LocalDate oldDate = ledger.getEntryDate();
        BigDecimal percentChange = calculatePercentChange(user, req.getEntryDate(), req.getClosingPrice());

        ledger.setEntryDate(req.getEntryDate());
        ledger.setClosingPrice(req.getClosingPrice());
        ledger.setPercentageChange(percentChange);
        ledger.setSummaryText(req.getSummaryText());
        ledger.setCompletedDisciplines(req.getCompletedDisciplines());
        ledger.setTags(req.getTags());

        DailyLedger saved = ledgerRepository.save(ledger);
        
        // If date changed, the old date's next entry needs recalculation too
        if (!oldDate.equals(req.getEntryDate())) {
            recalculateNextEntryPercentChange(user, oldDate);
        }
        recalculateNextEntryPercentChange(user, saved.getEntryDate());
        
        return DailyLedgerResponse.from(saved);
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────
    @Transactional
    public void deleteEntry(UUID id) {
        User user = currentUser();
        DailyLedger ledger = ledgerRepository.findById(id)
            .filter(l -> l.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new EntityNotFoundException("Ledger entry not found: " + id));
        LocalDate deletedDate = ledger.getEntryDate();
        ledgerRepository.delete(ledger);
        recalculateNextEntryPercentChange(user, deletedDate);
    }

    // ─── STOCK SUMMARY ───────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public StockSummaryResponse getStockSummary() {
        User user = currentUser();

        List<DailyLedger> all = ledgerRepository.findByUserOrderByEntryDateAsc(user);
        if (all.isEmpty()) {
            return StockSummaryResponse.builder()
                .currentPrice(BigDecimal.ZERO)
                .dailyChange(BigDecimal.ZERO)
                .dailyChangePercent(BigDecimal.ZERO)
                .sevenDaySma(null)
                .allTimeHigh(null)
                .allTimeLow(null)
                .totalEntries(0)
                .build();
        }

        DailyLedger latest = all.get(all.size() - 1);
        BigDecimal currentPrice = latest.getClosingPrice();
        BigDecimal dailyChangePct = latest.getPercentageChange() != null
            ? latest.getPercentageChange() : BigDecimal.ZERO;

        BigDecimal dailyChange = all.size() >= 2
            ? currentPrice.subtract(all.get(all.size() - 2).getClosingPrice())
            : BigDecimal.ZERO;

        BigDecimal sma = calculateSma(user);
        BigDecimal ath = ledgerRepository.findAllTimeHigh(user).orElse(null);
        BigDecimal atl = ledgerRepository.findAllTimeLow(user).orElse(null);

        return StockSummaryResponse.builder()
            .currentPrice(currentPrice)
            .dailyChange(dailyChange.setScale(2, RoundingMode.HALF_UP))
            .dailyChangePercent(dailyChangePct)
            .sevenDaySma(sma)
            .allTimeHigh(ath)
            .allTimeLow(atl)
            .totalEntries(all.size())
            .build();
    }

    // ─── CHART DATA ──────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<DailyLedgerResponse> getChartData(String range) {
        User user = currentUser();
        LocalDate end = LocalDate.now();
        LocalDate start = switch (range.toUpperCase()) {
            case "1W" -> end.minusWeeks(1);
            case "1M" -> end.minusMonths(1);
            default   -> LocalDate.of(2000, 1, 1); // "ALL"
        };
        return ledgerRepository
            .findByUserAndEntryDateBetweenOrderByEntryDateAsc(user, start, end)
            .stream()
            .map(DailyLedgerResponse::from)
            .toList();
    }

    // ─── Private: 7-day SMA ──────────────────────────────────────────────────
    private BigDecimal calculateSma(User user) {
        List<DailyLedger> recent = ledgerRepository
            .findTopNByUserOrderByEntryDateDesc(user, SMA_PERIOD);

        if (recent.size() < SMA_PERIOD) return null;

        BigDecimal sum = recent.stream()
            .map(DailyLedger::getClosingPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.divide(BigDecimal.valueOf(SMA_PERIOD), 2, RoundingMode.HALF_UP);
    }

    // ─── Private: % Change from previous entry ────────────────────────────
    private BigDecimal calculatePercentChange(User user, LocalDate date, BigDecimal newPrice) {
        Optional<DailyLedger> prev = ledgerRepository.findPreviousEntry(user, date);
        if (prev.isEmpty() || prev.get().getClosingPrice().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal prevPrice = prev.get().getClosingPrice();
        return newPrice.subtract(prevPrice)
            .divide(prevPrice, 6, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .setScale(4, RoundingMode.HALF_UP);
    }

    // ─── Private: Recalculate next entry's % change ───────────────────────
    private void recalculateNextEntryPercentChange(User user, LocalDate date) {
        ledgerRepository.findNextEntry(user, date).ifPresent(next -> {
            BigDecimal percentChange = calculatePercentChange(user, next.getEntryDate(), next.getClosingPrice());
            next.setPercentageChange(percentChange);
            ledgerRepository.save(next);
        });
    }
}
