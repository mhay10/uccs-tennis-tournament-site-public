-- Wipe any current scores
DELETE FROM PoolMatches;

-- Insert new scores into table
INSERT INTO PoolMatches (pool_id, team1_id, team2_id, team1_score, team2_score)
SELECT t1.pool_id, t1.id, t2.id, ABS(RANDOM() % 15) + 15, ABS(RANDOM() % 15)
FROM Teams t1
JOIN Teams t2 ON t1.pool_id = t2.pool_id AND t1.id < t2.id
LEFT JOIN PoolMatches pm1 ON t1.id = pm1.team1_id AND t2.id = pm1.team2_id AND t1.pool_id = pm1.pool_id
LEFT JOIN PoolMatches pm2 ON t1.id = pm2.team2_id AND t2.id = pm2.team1_id AND t1.pool_id = pm2.pool_id
WHERE pm1.pool_id IS NULL AND pm2.pool_id IS NULL;

-- Show updated table
SELECT * FROM PoolMatches;

