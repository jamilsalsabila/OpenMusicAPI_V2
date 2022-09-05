/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable(
        'users',
        {
            id: {
                type: 'VARCHAR(25)',
                notNull: true,
                primaryKey: true,
                unique: true,
            },
            username: {
                type: 'VARCHAR(20)',
                notNull: true,
                unique: true,
            },
            password: {
                type: 'VARCHAR(65)',
                notNull: true,
            },
            fullname: {
                type: 'VARCHAR(50)',
                notNull: true,
            },
        },
    );
};

exports.down = pgm => {
    pgm.dropTable(
        'users',
        {
            ifExists: true,
            cascade: true,
        },
    );
};
