/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable(
        'playlists',
        {
            id: {
                type: 'VARCHAR(30)',
                notNull: true,
                primaryKey: true,
                unique: true,
            },
            name: {
                type: 'VARCHAR(50)',
                notNull: true,
            },
            owner: {
                type: 'VARCHAR(25)',
                notNull: true,
                references: 'users',
            },
        },
    );

    pgm.addConstraint(
        'playlists',
        'fk_user',
        {
            foreignKeys: {
                columns: 'owner',
                references: 'users(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        },
    );
};

exports.down = pgm => {
    pgm.dropConstraint(
        'playlist',
        'fk_user',
        {
            ifExists: true,
            cascade: true,
        },
    );

    pgm.dropTable(
        'playlists',
        {
            ifExists: true,
            cascade: true,
        },
    );
};
