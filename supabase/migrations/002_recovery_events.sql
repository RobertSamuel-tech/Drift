-- Migration 002: recovery_events
-- Tracks ghost feature identification and AI correction events
-- per project for the Drift Recovery Rate product metric.

CREATE TABLE IF NOT EXISTS recovery_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL    DEFAULT now(),
  project_id   uuid        NOT NULL    REFERENCES projects(id) ON DELETE CASCADE,
  feature_name text        NOT NULL,
  drift_type   text        NOT NULL    DEFAULT 'ghost',
  event_type   text        NOT NULL    CHECK (event_type IN ('identified', 'corrected'))
);

CREATE INDEX IF NOT EXISTS recovery_events_project_id_idx  ON recovery_events (project_id);
CREATE INDEX IF NOT EXISTS recovery_events_event_type_idx  ON recovery_events (event_type);
CREATE INDEX IF NOT EXISTS recovery_events_created_at_idx  ON recovery_events (created_at DESC);
