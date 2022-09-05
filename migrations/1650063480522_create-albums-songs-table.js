/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable(
        'albums',
        {
            id: {
                type: 'VARCHAR(25)',
                primaryKey: true,
                unique: true,
                notNull: true,
            },
            name: {
                type: 'VARCHAR(100)',
                notNull: true,
            },
            year: {
                type: 'SMALLINT',
                notNull: true,
            },
            insertedAt: {
                type: 'VARCHAR(30)',
                notNull: true,
            },
            updatedAt: {
                type: 'VARCHAR(30)',
                notNull: true,
            },
        },
    );

    pgm.createTable(
        'songs',
        {
            id: {
                type: 'VARCHAR(25)',
                primaryKey: true,
                unique: true,
                notNull: true,
            },
            title: {
                type: 'VARCHAR(50)',
                notNull: true,
            },
            year: {
                type: 'SMALLINT',
                notNull: true,
            },
            genre: {
                type: 'VARCHAR(15)',
                notNull: true,
            },
            performer: {
                type: 'VARCHAR(20)',
                notNull: true,
            },
            insertedAt: {
                type: 'VARCHAR(30)',
                notNull: true,
            },
            updatedAt: {
                type: 'VARCHAR(30)',
                notNull: true,
            },
            duration: {
                type: 'SMALLINT',
                notNull: false,
            },
            albumId: {
                type: 'VARCHAR(25)',
                notNull: false,
            },
        },
    );

    pgm.addConstraint(
        'songs',
        'fk_album',
        {
            foreignKeys: {
                columns: 'albumId',
                references: 'albums(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        },
    );
};

exports.down = pgm => {
    pgm.dropConstraint(
        'songs',
        'fk_album',
        {
            ifExists: true,
            cascade: true,
        },
    );

    pgm.dropTable(
        'albums',
        {
            ifExists: true,
            cascade: true,
        }
    );

    pgm.dropTable(
        'songs',
        {
            ifExists: true,
            cascade: true,
        },
    );
};
