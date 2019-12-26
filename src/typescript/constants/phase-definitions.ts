interface ObjectWithStringKeysAndNumericalArrays {
    [key: string]: Array<number>;
}

export const PHASE_BY_KEY = [
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    4.5,
    5,
    5.5,
    6,
    6.5,
    7,
    7.5,
    8,
    8.5
];

export const PHASE_BY_SECOND: ObjectWithStringKeysAndNumericalArrays = {
    // Erangel
    'Erangel_Main': [
        120,
        300,
        300,
        200,
        140,
        150,
        90,
        120,
        60,
        120,
        40,
        90,
        30,
        90,
        30,
        60
    ],
    // Mirimar
    'Desert_Main': [
        120,
        300,
        300,
        200,
        140,
        150,
        90,
        120,
        60,
        120,
        40,
        90,
        30,
        90,
        30,
        60
    ],
    // Vikindi
    'DihorOtok_Main': [
        90,
        300,
        300,
        120,
        90,
        120,
        90,
        60,
        90,
        60,
        90,
        30,
        90,
        90,
        60,
        60
    ],
    // Sanhok
    'Savage_Main': [
        90,
        240,
        240,
        40,
        120,
        90,
        120,
        60,
        120,
        40,
        60,
        50,
        60,
        40,
        40,
        50
    ]
};
