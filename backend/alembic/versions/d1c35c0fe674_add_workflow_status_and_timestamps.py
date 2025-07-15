"""Add workflow status and timestamps

Revision ID: d1c35c0fe674
Revises: 503bac92939e
Create Date: 2025-07-15 07:13:14.649006
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd1c35c0fe674'
down_revision: Union[str, Sequence[str], None] = '503bac92939e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add enum type
    workflow_status_enum = postgresql.ENUM('draft', 'published', 'archived', name='workflowstatus')
    workflow_status_enum.create(op.get_bind())

    op.add_column('workflows', sa.Column(
        'status',
        sa.Enum('draft', 'published', 'archived', name='workflowstatus'),
        nullable=False,
        server_default='draft'
    ))

    op.add_column('workflows', sa.Column('last_saved_at', sa.DateTime(), nullable=True))
    op.add_column('workflows', sa.Column('autosaved_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('workflows', 'autosaved_at')
    op.drop_column('workflows', 'last_saved_at')
    op.drop_column('workflows', 'status')

    # Drop enum
    workflow_status_enum = postgresql.ENUM('draft', 'published', 'archived', name='workflowstatus')
    workflow_status_enum.drop(op.get_bind())
