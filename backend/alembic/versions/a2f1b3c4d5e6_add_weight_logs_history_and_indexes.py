"""add weight_logs_history table and datetime indexes

Revision ID: a2f1b3c4d5e6
Revises: c910b53b1fcd
Create Date: 2026-02-19 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a2f1b3c4d5e6'
down_revision: Union[str, None] = 'c910b53b1fcd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create weight_logs_history table (was missing from initial migration)
    op.create_table('weight_logs_history',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('pet_id', sa.Integer(), nullable=False),
        sa.Column('datetime', sa.DateTime(timezone=True), nullable=False),
        sa.Column('weight_kg', sa.Float(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['pet_id'], ['pets.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_weight_logs_history_pet_id'),
        'weight_logs_history', ['pet_id'], unique=False,
    )

    # Add datetime indexes for range queries (PERF-04)
    op.create_index(
        'ix_feeding_logs_datetime', 'feeding_logs', ['datetime'], unique=False,
    )
    op.create_index(
        'ix_water_logs_datetime', 'water_logs', ['datetime'], unique=False,
    )
    op.create_index(
        'ix_events_datetime_start', 'events', ['datetime_start'], unique=False,
    )
    op.create_index(
        'ix_symptoms_datetime', 'symptoms', ['datetime'], unique=False,
    )
    op.create_index(
        'ix_weight_logs_history_datetime',
        'weight_logs_history', ['datetime'], unique=False,
    )
    op.create_index(
        'ix_medications_start_date', 'medications', ['start_date'], unique=False,
    )
    op.create_index(
        'ix_vaccines_date_administered', 'vaccines', ['date_administered'], unique=False,
    )


def downgrade() -> None:
    op.drop_index('ix_vaccines_date_administered', table_name='vaccines')
    op.drop_index('ix_medications_start_date', table_name='medications')
    op.drop_index('ix_weight_logs_history_datetime', table_name='weight_logs_history')
    op.drop_index('ix_symptoms_datetime', table_name='symptoms')
    op.drop_index('ix_events_datetime_start', table_name='events')
    op.drop_index('ix_water_logs_datetime', table_name='water_logs')
    op.drop_index('ix_feeding_logs_datetime', table_name='feeding_logs')
    op.drop_index(op.f('ix_weight_logs_history_pet_id'), table_name='weight_logs_history')
    op.drop_table('weight_logs_history')
