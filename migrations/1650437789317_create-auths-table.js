/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable(
        'tokens',
        {
            refreshToken: {
                type: 'TEXT',
                notNull: true,
            },
        },
    );
};

exports.down = pgm => {
    pgm.dropTable(
        'tokens',
        {
            ifExists: true,
            cascade: true,
        },
    );
};
