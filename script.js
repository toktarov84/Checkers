const cells = [ // Создание двумерного массива со ссылками на ноды клеток доски.
    document.querySelectorAll('tr.row_0 > td'),
    document.querySelectorAll('tr.row_1 > td'),
    document.querySelectorAll('tr.row_2 > td'),
    document.querySelectorAll('tr.row_3 > td'),
    document.querySelectorAll('tr.row_4 > td'),
    document.querySelectorAll('tr.row_5 > td'),
    document.querySelectorAll('tr.row_6 > td'),
    document.querySelectorAll('tr.row_7 > td')
];
const turn = document.querySelectorAll('.turn'); // Нод индикации очереди хода.
const white_score = document.querySelector('.white_score');
const black_score = document.querySelector('.black_score');
const link = document.querySelector('link');     // Нод подключения css скрипта.

let board;      // Стартовая доска.
let turnFlag;   // Флаг очереди хода.
let queue = []; // Очередь кликов по доске.
let whiteScore; // Счёт белых.
let blackScore; // Счёт чёрных.

// Бинды для удобства работы с кодом.
const click1 = () => queue[0][0]; // Объект с клеткой, которая выбрана первой.
const click2 = () => queue[1][0]; // Объект с клеткой, которая выбрана второй.
const row1 = () => +queue[0][1];  // Горизонталь первого клика.
const row2 = () => +queue[1][1];  // Горизонталь второго клика.
const col1 = () => +queue[0][2];  // Вертикаль первого клика.
const col2 = () => +queue[1][2];  // Вертикаль второго клика.
const whose = () => (turnFlag? '<p class="white"></p>': '<p class="black"></p>'); // HTML код шашки цвета очереди хода.
const whoseKing = () => (turnFlag? '<p class="white_king"></p>': '<p class="black_king"></p>'); // HTML код дамки цвета очереди хода.
const whomCapture = () => (turnFlag? '<p class="black"></p>': '<p class="white"></p>'); // HTML код шашки цвета противоположного очереди хода.

start()

function start() { // Начало партии.
    whiteScore = 0; // Обнуляем счёт белых.
    blackScore = 0; // Обнуляем счёт чёрных.
    turn[0].style.color = 'black';      // Выделение очереди хода чёрным цветом.
    turn[1].style.color = 'lightgrey';
    if (link.getAttribute('href') == 'css/style1.css') {    // Проверка поворота доски.
        turnFlag = true;                                    // Иннициализация флага очереди хода. (true - ход белых)
    } else { turnFlag = false; }
    board = [   // Массив со стартовой позицией.
        [null, '<p class="black"></p>', null, '<p class="black"></p>', null, '<p class="black"></p>', null, '<p class="black"></p>'],
        ['<p class="black"></p>', null, '<p class="black"></p>', null, '<p class="black"></p>', null, '<p class="black"></p>', null],
        [null, '<p class="black"></p>', null, '<p class="black"></p>', null, '<p class="black"></p>', null, '<p class="black"></p>'],
        ['', null                     , '', null                     , '', null                     , '', null                     ],
        [null, ''                     , null, ''                     , null, ''                     , null, ''                     ],
        ['<p class="white"></p>', null, '<p class="white"></p>', null, '<p class="white"></p>', null, '<p class="white"></p>', null],
        [null, '<p class="white"></p>', null, '<p class="white"></p>', null, '<p class="white"></p>', null, '<p class="white"></p>'],
        ['<p class="white"></p>', null, '<p class="white"></p>', null, '<p class="white"></p>', null, '<p class="white"></p>', null]
    ];
    for (let row in cells) {               // Проходим по массиву доски.
        for (let col in cells[row]) {
            if (board[row][col] == null) { // Если клетка пустая, то в HTML код нода ячейки таблицы сохраняем пустую строку.
                cells[row][col].innerHTML = '';
                continue;
            }
            cells[row][col].innerHTML = board[row][col]; // Если не пустая, то записываем значения из стартового массива,
            cells[row][col].onclick = function() {       // и создаём событие реагирующе на нажатие по ячейкам доски,
                action(this, +row, +col);                // передающее в метод action текущий нод и значения горизонтали\вертикали.
            }
        }
    }
}
function action(it, row, col) {
    queue.push([it, +row, +col]);                     // Добавлям в очередь массив из текущего объекта нода и значений горизонтали\вертикали.
    if (queue.length > 2) { queue.shift(); }          // Если в очереди больше двух объектов, то удаляем самый старый.
    if (click2().innerHTML != '') { return; }         // Если HTML код второй выбранной ячейки не пустой, то ждём следующего нажатия.
    if (click1().innerHTML == whose()) {              // Проверяем совпадает ли цвет выбранной шашки с очередью хода.
        move()                                        // Если совпадает, то запускаем метод хода.
    } else if (click1().innerHTML == whoseKing()) {   // Если первой нажатие это дамка,
        kingMove()                                    // то запускаем метод хода дамкой.
    }
}
function move() { // Метод хода шашкой.
    if (Math.abs(col1() - col2()) == 2 && Math.abs(row1() - row2()) == 2) {            // Проверка взятие ход или нет. (+-2 горизонтали и вертикали)
        let row = (row2() - row1() > 0)? row1() + 1: row1() - 1;                       // Соседняя горизонталь в направлении взятия
        let col = (col2() - col1() > 0)? col1() + 1: col1() - 1;                       // Соседняя вертикаль в направлении взятия
        if (cells[row][col].innerHTML.slice(10, 15) == whomCapture().slice(10, 15)) {  // Проверка что соседняя шашка в направлении взятия противоположного цвета
            cells[row][col].innerHTML = '';                                            // Заполняем HTML код нода соседней шашки пустой строкой. (стираем взятую шашку)
            plusScore();                                                               // Метод счёта взятий и сообщений о победе.
            if (hasCapture(row2(), col2())) {                                          // Проверяем, есть ли следующее взятие.
                [turn[0].style.color, turn[1].style.color] = [turn[1].style.color, turn[0].style.color]; // Меняем местами цвета индикации хода.
                turnFlag = !turnFlag;                                                                    // Инвентируем флаг очереди хода.
            }
            swap();                                                                    // Обмен ссылко на ноды клеток первого и второго нажатия.
        }
    } else if (Math.abs(col1() - col2()) == 1) {                                                 // Проверка на обычный ход. (+-1 по вертикали)
        if (turnFlag && row1() - row2() == 1 || !turnFlag && row1() - row2() == -1) { swap(); }  // (+-1 по горизонтали, учитывая очередность хода). Обмен.
    }
}
function kingMove() { // Метод хода дамкой.
    let vRow = (row2() - row1() > 0)? +1: -1;   // направление сдвига по горизонтали в сторону хода.
    let vCol = (col2() - col1() > 0)? +1: -1;   // направление сдвига по вертикали в сторону хода.
    let own = [];                               // Массив(вектор) хода своих(чья очередь хода) шашек.
    let enemy = [];                             // Массив(вектор) хода чужих(противополжных очереди хода) шашек.
    for (let row = row1(), col = col1(); row != row2(), col != col2(); row += vRow, col += vCol) {                  // Проходим по диагонали от первого нажатия, до второго.
        if (cells[row][col].innerHTML.slice(10, 15) == whose().slice(10, 15)) own.push(cells[row][col]);            // Добавляем встречающиеся "свои" шашки.
        if (cells[row][col].innerHTML.slice(10, 15) == whomCapture().slice(10, 15)) enemy.push(cells[row][col]);    // Добавляем встречающиеся "чужие" шашки.
    }
    if (own.length == 1) {                      // Если "своя" шашка одна(которая ходит),
        if (enemy.length == 1) {                // Если "чужая" одна(которую бьём),
            enemy[0].innerHTML = '';            // то стираем убитую шашку
            plusScore();                        // Метод счёта взятий и сообщений о победе.
            if (hasCapture(row2(), col2())) {   // Если можно взять ещё раз,
                [turn[0].style.color, turn[1].style.color] = [turn[1].style.color, turn[0].style.color];
                turnFlag = !turnFlag;           // то возвращаем очередь хода той же стороне.
            }
        }
        swap();                                 // Обмениваем клетки первого и второго нажатия местами.
    }
}
function plusScore() { // Метод подсчитывающий взятые шашки и объявляющий победу.
    if (cells[row1()][col1()].innerHTML.slice(10, 15) == 'black') {         // Если шашка чёрная
        blackScore = blackScore + 1;                                        // Прибавляем единичку к счёту чёрных
        black_score.innerHTML = blackScore;                                 // Изменяем счёт на странице
        if (blackScore == 12) { alert('Чёрные победили!'); }                // Если счёт равено 12, выдаём диалоговое сообщение о победе
    } else if (cells[row1()][col1()].innerHTML.slice(10, 15) == 'white') {  // Иначе тоже самое за белых.
        whiteScore = whiteScore + 1;
        white_score.innerHTML = whiteScore;
        if (whiteScore == 12) { alert('Белые победили!'); }
    }
}
function hasCapture(row, col) { // Метод проверки возможности повторных взятий.
    return row+2 <= 7 && col+2 <= 7 && cells[row+2][col+2].innerHTML == '' && // Если по какому-то направлению, через одну клетку, не выходит за пределы доски и клетка пустая
        cells[row+1][col+1].innerHTML.slice(10, 15) == whomCapture().slice(10, 15) || // и на соседней клетке, в том же направлении, есть вражеская шашка.
        row-2 >= 0 && col-2 >= 0 && cells[row-2][col-2].innerHTML == '' &&
        cells[row-1][col-1].innerHTML.slice(10, 15) == whomCapture().slice(10, 15) ||
        row-2 >= 0 && col+2 <= 7 && cells[row-2][col+2].innerHTML == '' &&
        cells[row-1][col+1].innerHTML.slice(10, 15) == whomCapture().slice(10, 15) ||
        row+2 <= 7 && col-2 >= 0 && cells[row+2][col-2].innerHTML == '' &&
        cells[row+1][col-1].innerHTML.slice(10, 15) == whomCapture().slice(10, 15);
}
function swap() { // Метод обмена.
    toKing();                                                                                   // Если шашка дошла до последней горизонтали, превращается в дамку.
    [click1().innerHTML, click2().innerHTML] = [click2().innerHTML, click1().innerHTML];        // Обмениваем значения клеток первого и второго нажатия.
    [turn[0].style.color, turn[1].style.color] = [turn[1].style.color, turn[0].style.color];    // Изменяем индикатор очереди хода.
    turnFlag = !turnFlag;
}
function toKing() { // Метод превращения в дамку.
    if (click1().innerHTML == '<p class="black"></p>' && row2() == 7) {         // Если шашка чёрная и дошла до 8й горизонтали,
        click1().innerHTML = '<p class="black_king"></p>';                      // то превращается в чёрную дамку.
    }
    else if (click1().innerHTML == '<p class="white"></p>' && row2() == 0) {    // Иначе, если шашка белая и дошла до 1й горизонтали,
        click1().innerHTML = '<p class="white_king"></p>';                      // то превращается в белую дамку.
    }
}
function turnColor() { // Метод поворота доски.
    if (link.getAttribute('href') == 'css/style1.css') {    // Проверяем первый ли стиль загружен,
        link.href = 'css/style2.css';                       // Если первый, то загружаем второй стиль
        start()                                             // Перезапускаем метод начала игры.
    } else {
        link.href = 'css/style1.css';                       // Иначе загружаем первый стиль.
        start()
    }
}