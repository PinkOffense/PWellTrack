"""add sent_notifications table

Revision ID: b3c4d5e6f7a8
Revises: a2f1b3c4d5e6
Create Date: 2026-02-20 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, None] = 'a2f1b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('sent_notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('notification_key', sa.String(length=255), nullable=False),
        sa.Column('sent_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'notification_key', 'sent_date', name='uq_sent_notification'),
    )
    op.create_index(
        op.f('ix_sent_notifications_user_id'),
        'sent_notifications', ['user_id'], unique=False,
    )
    op.create_index(
        op.f('ix_sent_notifications_sent_date'),
        'sent_notifications', ['sent_date'], unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_sent_notifications_sent_date'), table_name='sent_notifications')
    op.drop_index(op.f('ix_sent_notifications_user_id'), table_name='sent_notifications')
    op.drop_table('sent_notifications')
