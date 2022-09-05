/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable(
        'collaborations',
        {
            id: {
                type: 'VARCHAR(30)',
                notNull: true,
                unique: true,
                primaryKey: true,
            },
            playlist_id: {
                type: 'VARCHAR(30)',
                notNull: true,
            },
            user_id: {
                type: 'VARCHAR(25)',
                notNull: true,
            }
        }
    );

    pgm.addConstraint(
        'collaborations',
        'fk_playlist',
        {
            foreignKeys: {
                columns: 'playlist_id',
                references: 'playlists(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        },
    );

    pgm.addConstraint(
        'collaborations',
        'fk_user',
        {
            foreignKeys: {
                columns: 'user_id',
                references: 'users(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        },
    );

};

exports.down = pgm => {
    pgm.dropConstraint(
        'collaborations',
        'fk_playlist',
        {
            ifExists: true,
            cascade: true,
        }
    );

    pgm.dropConstraint(
        'collaborations',
        'fk_user',
        {
            ifExists: true,
            cascade: true,
        }
    );

    pgm.dropTable(
        'collaborations',
        {
            ifExists: true,
            cascade: true,
        }
    );
};
