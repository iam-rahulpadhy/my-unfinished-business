package com.mub.myunfinishedbusiness.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "daily_ledger",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "entry_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    /**
     * Closing stock price for the day (e.g., 105.75)
     */
    @Column(name = "closing_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal closingPrice;

    /**
     * Daily percentage change relative to previous day's close.
     * Auto-calculated by LedgerService if not provided.
     */
    @Column(name = "percentage_change", precision = 8, scale = 4)
    private BigDecimal percentageChange;

    /**
     * 3-bullet executive summary of the day.
     */
    @Column(name = "summary_text", columnDefinition = "TEXT")
    private String summaryText;

    /**
     * Comma-separated list of completed discipline names for the day.
     */
    @Column(name = "completed_disciplines", columnDefinition = "TEXT")
    private String completedDisciplines;

    /**
     * Comma-separated list of focus tags.
     */
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
