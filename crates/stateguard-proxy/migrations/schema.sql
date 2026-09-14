-- StateGuard PostgreSQL Schema
-- Migration 001: Core Tenants, Agent Sessions, and Security Audit Events

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(64) NOT NULL UNIQUE,
    mode VARCHAR(32) DEFAULT 'STATEFUL_VAULT', -- 'STATEFUL_VAULT' | 'STATELESS_BINDING'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    external_session_id VARCHAR(255) NOT NULL,
    bound_user_id VARCHAR(255) NOT NULL,
    model_family VARCHAR(64) NOT NULL,
    current_turn INT DEFAULT 0,
    merkle_root BYTEA,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, external_session_id)
);

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL, -- 'CROSS_USER_REPLAY', 'MODEL_MISMATCH', 'SECRET_IN_STATE', 'INJECTION_ATTEMPT'
    severity VARCHAR(16) NOT NULL,   -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    payload_fingerprint VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_tenant_time ON security_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_lookup ON agent_sessions(tenant_id, external_session_id);

-- Default Demo / Development Tenant
INSERT INTO tenants (id, name, api_key_hash, mode)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Default Dev Tenant',
    -- sha256 of "stateguard_dev_secret_key"
    'c2c19e5d713c7bb610f44fc5d14dfb031444158933bcf41029c7d0e42ec9a5b3',
    'STATEFUL_VAULT'
) ON CONFLICT (api_key_hash) DO NOTHING;
