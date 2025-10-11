package com.backend.Java_Backend;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
public class HikariConfigLogger {

    private static final Logger logger = LoggerFactory.getLogger(HikariConfigLogger.class);

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void logHikariConfig() {
        if (dataSource instanceof HikariDataSource hikariDataSource) {
            logger.info("HikariCP Configuration:");
            logger.info("Maximum Pool Size: {}", hikariDataSource.getMaximumPoolSize());
            logger.info("Minimum Idle: {}", hikariDataSource.getMinimumIdle());
            logger.info("Idle Timeout: {} ms", hikariDataSource.getIdleTimeout());
            logger.info("Max Lifetime: {} ms", hikariDataSource.getMaxLifetime());
            logger.info("Connection Timeout: {} ms", hikariDataSource.getConnectionTimeout());
            logger.info("Auto Commit: {}", hikariDataSource.isAutoCommit());
            logger.info("Prepare Threshold: {}", hikariDataSource.getDataSourceProperties().getProperty("prepareThreshold"));
            logger.info("Cache Prepared Statements: {}", hikariDataSource.getDataSourceProperties().getProperty("cachePrepStmts"));
        } else {
            logger.warn("DataSource is not an instance of HikariDataSource");
        }
    }
}