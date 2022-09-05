/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable(
        'playlist_song_activities',
        {
            id: {
                type: 'VARCHAR(38)',
                unique: true,
                primaryKey: true,
                notNull: true,
            },
            playlist_id: {
                type: 'VARCHAR(30)',
                notNull: true,
            },
            song_id: {
                type: 'VARCHAR(25)',
                notNull: true,
            },
            user_id: {
                type: 'VARCHAR(25)',
                notNull: true,
            },
            action: {
                type: 'VARCHAR(8)',
                notNull: true,
            },
            time: {
                type: 'TIMESTAMP WITH TIME ZONE',
                default: pgm.func('current_timestamp'),
                notNull: true,
            },
        }
    );

    pgm.addConstraint(
        'playlist_song_activities',
        'fk_playlist',
        {
            foreignKeys: {
                columns: 'playlist_id',
                references: 'playlists(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        }
    );

    pgm.addConstraint(
        'playlist_song_activities',
        'fk_song',
        {
            foreignKeys: {
                columns: 'song_id',
                references: 'songs(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        }
    );

    pgm.addConstraint(
        'playlist_song_activities',
        'fk_user',
        {
            foreignKeys: {
                columns: 'user_id',
                references: 'users(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        }
    );
};

exports.down = pgm => {
    pgm.dropConstraint(
        'playlist_song_activities',
        'fk_playlist',
        {
            ifExists: true,
            cascade: true,
        }
    );

    pgm.dropConstraint(
        'playlist_song_activities',
        'fk_song',
        {
            ifExists: true,
            cascade: true,
        }
    );

    pgm.dropConstraint(
        'playlist_song_activities',
        'fk_user',
        {
            ifExists: true,
            cascade: true,
        }
    );

    pgm.dropTable(
        'playlist_song_activities',
        {
            ifExists: true,
            cascade: true,
        }
    );
};
