/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable(
        'playlists_songs',
        {
            playlistId: 'VARCHAR(30) NOT NULL',
            songId: 'VARCHAR(25) NOT NULL',
        },
    );

    pgm.addConstraint(
        'playlists_songs',
        'fk_playlist',
        {
            foreignKeys: {
                columns: 'playlistId',
                references: 'playlists(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        },
    );

    pgm.addConstraint(
        'playlists_songs',
        'fk_song',
        {
            foreignKeys: {
                columns: 'songId',
                references: 'songs(id)',
                onDelete: 'cascade',
                onUpdate: 'cascade',
            },
        },
    );
};

exports.down = pgm => {
    pgm.dropConstraint(
        'playlists_songs',
        'fk_playlist',
        {
            ifExists: true,
            cascade: true,
        },
    );

    pgm.dropConstraint(
        'playlists_songs',
        'fk_song',
        {
            ifExists: true,
            cascade: true,
        },
    );

    pgm.dropTable(
        'playlists_songs',
        {
            ifExists: true,
            cascade: true,
        },
    );
};
