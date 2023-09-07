-- Wipe any current teams
DELETE FROM PoolMatches;
DELETE FROM PoolStandings;
DELETE FROM BracketMatches;
DELETE FROM Teams;

-- Create list of teams to be inserted (id: team #, name: University of team #)
WITH RECURSIVE cte_teams(id, name, max_id) AS (
  SELECT 'team 1', 'University of team 1', 32 -- change this for # of teams
  UNION ALL
  SELECT 'team ' || CAST(CAST(SUBSTR(id, 5) AS INTEGER) + 1 AS TEXT), 'University of team ' || CAST(CAST(SUBSTR(id, 5) AS INTEGER) + 1 AS TEXT), max_id
  FROM cte_teams
  WHERE CAST(SUBSTR(id, 5) AS INTEGER) < max_id
)

-- Insert new list of teams
INSERT INTO Teams (id, name)
SELECT id, name
FROM cte_teams;

-- Show resulting TABLE
SELECT * FROM Teams;