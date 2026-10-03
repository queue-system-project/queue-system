CREATE TABLE institution_reviews (
    id UUID PRIMARY KEY,

    queue_entry_id UUID NOT NULL
        REFERENCES queue_entries(id)
        ON DELETE CASCADE,

    institution_id UUID NOT NULL
        REFERENCES institutions(id)
        ON DELETE CASCADE,

    client_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    rating INTEGER NOT NULL
        CHECK (rating >= 1 AND rating <= 5),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_institution_review_queue_entry
        UNIQUE (queue_entry_id)
);

CREATE INDEX idx_institution_reviews_institution_id
    ON institution_reviews(institution_id);

CREATE INDEX idx_institution_reviews_client_id
    ON institution_reviews(client_id);