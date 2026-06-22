package com.mub.myunfinishedbusiness.repository;

import com.mub.myunfinishedbusiness.entity.DailyLedger;
import com.mub.myunfinishedbusiness.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyLedgerRepository extends JpaRepository<DailyLedger, UUID> {

    List<DailyLedger> findByUserOrderByEntryDateAsc(User user);

    List<DailyLedger> findByUserAndEntryDateBetweenOrderByEntryDateAsc(
        User user, LocalDate start, LocalDate end
    );

    Optional<DailyLedger> findByUserAndEntryDate(User user, LocalDate entryDate);

    /**
     * Fetch the most recent N entries for a user (for SMA calculation).
     */
    @Query("SELECT dl FROM DailyLedger dl WHERE dl.user = :user " +
           "ORDER BY dl.entryDate DESC LIMIT :n")
    List<DailyLedger> findTopNByUserOrderByEntryDateDesc(
        @Param("user") User user, @Param("n") int n
    );

    /**
     * Get the most recent entry before a given date (for % change calculation).
     */
    @Query("SELECT dl FROM DailyLedger dl WHERE dl.user = :user " +
           "AND dl.entryDate < :date ORDER BY dl.entryDate DESC LIMIT 1")
    Optional<DailyLedger> findPreviousEntry(
        @Param("user") User user, @Param("date") LocalDate date
    );

    /**
     * Get the next entry after a given date (for % change chain repair).
     */
    @Query("SELECT dl FROM DailyLedger dl WHERE dl.user = :user " +
           "AND dl.entryDate > :date ORDER BY dl.entryDate ASC LIMIT 1")
    Optional<DailyLedger> findNextEntry(
        @Param("user") User user, @Param("date") LocalDate date
    );

    @Query("SELECT MIN(dl.closingPrice) FROM DailyLedger dl WHERE dl.user = :user")
    Optional<java.math.BigDecimal> findAllTimeLow(@Param("user") User user);

    @Query("SELECT MAX(dl.closingPrice) FROM DailyLedger dl WHERE dl.user = :user")
    Optional<java.math.BigDecimal> findAllTimeHigh(@Param("user") User user);

    long countByUser(User user);
}
