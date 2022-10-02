const NUMS = 32;
const ROWS = 16;

class Hero {
    constructor(name, playability = false, params, position, initiative = 1, id) {
        this.name = name;
        this.level = params.level;
        this.st = params.st;
        this.ag = params.ag;
        this.body = params.body;
        this.hp = params.body * 10;
        this.playability = playability;
        this.x = position.x;
        this.y = position.y;
        this.initiative = initiative;
        this.turn = true;
        this.target_id = 0;
        this.target_x = 0;
        this.target_y = 0;
        this.id = id;
    }


    setPositionX(x) {
        this.x = x;
    }

    setPositionY(y) {
        this.y = y;
    }

    setTurn(flag) {
        this.turn = flag;
    }

    getTurn() {
        return this.turn;
    }

    move(view, order) {
        if(view.hasClass('active')) {
            view.removeClass('active');
            toggleHeroRadius(false, 1, view.data('row'), view.data('num'), order);
        } else {
            view.addClass('active');
            toggleHeroRadius(true, 1, view.data('row'), view.data('num'), order);
        }
    }

    setHP(hp) {
        this.hp = hp;
    }
}

let params = {
    level : 1,
    st : 1,
    ag : 1,
    body : 1,
}

let hero = new Hero('hero', true, params, {x:3, y: 3}, 1);
//let hero2 = new Hero('hero', true, params, {x:6, y: 7}, 3);
let monster = new Hero('monster', false, params, {x:8, y: 8}, 4);
hero.id = 1;
//hero2.id = 2;
monster.id = 10;


//let actors = [hero, hero2, monster];
let actors = [hero, monster];

class Engine {
    constructor(objects) {
        this.objects = objects;
        this.turns = 0;
    }

    init() {
        let stack = [];
        let stack2 = [];
        stack = this.objects.sort((a, b) => a.initiative > b.initiative ? 1 : -1 )
        stack.forEach(function(item, index) {
            if(index === 0) {
                stack2[index] = {'item': item, 'current': true,}
            } else {
                stack2[index] = {'item': item, 'current': false,}
            }
        });
        return stack2;
    }

    endturn(stack) {
        this.turns++;
        stack.forEach(element => {
            if(element.item.name == 'monster') {
                scanningEnvironment(element)
                if(element.target_id && element.target_id !== 0) {
                    //проверяем, рядом ли противник
                    if(isNearby(element)) {
                        //дерёмся
                    } else {
                        //пытаемся переместиться
                        if(element.item.y == element.target_y) {
                            if(element.item.x > element.target_x) {
                                left(element);
                            } else {
                                right(element);
                            }
                        } else {
                            if(element.item.y < element.target_y) {
                                bottom_left(element)
                            } else {
                                top_left(element)
                            }
                        }
                    }
                } else {
                    //рандомное перемещение
                    let rand = getRandomInt(7);
                    switch (rand) {
                        case 0:
                            break;
                        case 1:
                            right(element)
                            break;
                        case 2:
                            left(element)
                            break;
                        case 3:
                            bottom_right(element)
                            break;
                        case 4:
                            top_left(element)
                            break;
                        case 5:
                            bottom_left(element)
                            break;
                        case 6:
                            top_right(element)
                            break;
                        default:
                            //alert( "Нет таких значений" );
                    }
                }
            }
        })
        //console.log(actors)
        return stack.forEach(element => element.item.setTurn(true));
    }
}

let engine = new Engine(actors);
let stack = engine.init();
restart();

$(document).ready(function(){
    updateHPs()

    actors.forEach(function(element) {
        let classElem = element.playability ? 'hero' : 'monster';
        let viewElem = $("a[data-row='" + element.y + "'][data-num='" + element.x + "']");
        viewElem.addClass(classElem);
        viewElem.attr('data-link', element.id);
    });

    $('#hexGrid').on('click', 'a.hero', function(e){
        e.preventDefault();
        let currentHeroId = $(this).data('link');
        let currentHero = actors.find(x => x.id === currentHeroId);
        if(currentHero.getTurn()) {
            currentHero.move($(this), $(this).data('link'));
        }
    }); 

    $("#hexGrid").on('click', 'a.accessible', function(e){
        e.preventDefault();
        let currentHeroId = $('.hero.active').data('link');
        let currentHero = actors.find(x => x.id === currentHeroId);
        currentHero.setPositionX($(this).data('num'))
        currentHero.setPositionY($(this).data('row'))
        currentHero.setTurn(false)
        moveHero($(this).data('row'), $(this).data('num'), $(this).data('link-accessible'));
        toggleHeroRadius(false, 1, $(this).data('row'), $(this).data('num'));
    });

    $("#hexGrid").on('click', 'a.monster', function(e){
        e.preventDefault();
        if($(this).hasClass('monster')) {
            //let currentHeroId = $('.hero.active').data('link');
            //let currentHero = actors.find(x => x.id === currentHeroId);
            //console.log($(this).data('link'))
            //getFight(actors[$(this).data('link')]);
        }
    });      

    $(".end-turn").on('click', function(e){
        e.preventDefault();
        engine.endturn(stack);
        clearHeroClass()
        updateTurns(engine.turns)
    });  

    $('#coords').on('click', function(e){
        if($(this).hasClass('show')) {
            $(this).removeClass('show')
            $('.hexIn').removeClass('hexInCoords')
        } else {
            $(this).addClass('show');
            $('.hexIn').addClass('hexInCoords')
        }
    })  
})

function repeat() {
    $("#hexGrid a").removeClass('hero');
    $("#hexGrid a").removeClass('accessible');
    //$("a[data-row='3'][data-num='3']").addClass('hero');
    //$("a[data-row='4'][data-num='6']").addClass('monster');


    /*if(hero.wins > 0 && monster.wins > 0) {
        let percent = hero.wins / (hero.wins + monster.wins);
        let ttk = hero.ttk / (hero.wins + monster.wins)
        $('.hero_wins_percent').text(+percent.toFixed(2));
        $('.ttk').text(+ttk.toFixed(2));
    }*/
}

function restart() {
    $("#hexGrid a").removeClass('hero');
    $("#hexGrid a").removeClass('accessible');
    //$("a[data-row='3'][data-num='3']").addClass('hero');
    //$("a[data-row='4'][data-num='6']").addClass('monster');


    /*if(hero.wins > 0 && monster.wins > 0) {
        let percent = hero.wins / (hero.wins + monster.wins);
        let ttk = hero.ttk / (hero.wins + monster.wins)
        $('.hero_wins_percent').text(+percent.toFixed(2));
        $('.ttk').text(+ttk.toFixed(2));
    }*/
}

function scanningEnvironment(element) {
    let environment = [
        [element.item.x - 1, element.item.y - 2],
        [element.item.x, element.item.y - 2],
        [element.item.x + 1, element.item.y - 2],

        [element.item.x - 2 + (element.item.y - 1) % 2, element.item.y - 1],
        [element.item.x - 1 + (element.item.y - 1) % 2, element.item.y - 1],
        [element.item.x + (element.item.y - 1) % 2, element.item.y - 1],
        [element.item.x + 1 + (element.item.y - 1) % 2, element.item.y - 1],

        [element.item.x + 3, element.item.y],
        [element.item.x + 2, element.item.y],
        [element.item.x + 1, element.item.y],
        [element.item.x - 1, element.item.y],
        [element.item.x - 2, element.item.y],
        [element.item.x - 3, element.item.y],

        [element.item.x - 2 + (element.item.y + 1) % 2, element.item.y + 1],
        [element.item.x - 1 + (element.item.y + 1) % 2, element.item.y + 1],
        [element.item.x + (element.item.y + 1) % 2, element.item.y + 1],
        [element.item.x + 1 + (element.item.y + 1) % 2, element.item.y + 1],

        [element.item.x - 1, element.item.y + 2],
        [element.item.x, element.item.y + 2],
        [element.item.x + 1, element.item.y + 2],
    ];
    //console.log(environment);

    let target_hero = null;
    actors.forEach(function(actor) {
        if(actor.name === 'hero') {
            target_hero = environment.find(function(element) {
                return (actor.x === element[0] && actor.y === element[1])
            })
        }
    })
    //element.target_id = target_hero ? target_hero : null

    //console.log(actors)

    if(target_hero && $("a[data-row='" + target_hero[1] + "'][data-num='" + target_hero[0] + "']").data('link')) {
        let id = $("a[data-row='" + target_hero[1] + "'][data-num='" + target_hero[0] + "']").data('link');
        element.target_id = id;
        element.target_x = target_hero[0];
        element.target_y = target_hero[1];
    } else {
        element.target_id = 0;
        element.target_x = 0;
        element.target_y = 0;
    }
}

function isNearby(element) {
    //environment bug!
    let nearby_flag = false;
    let nearby = [
        [element.item.x - 1 + (element.item.y - 1) % 2, element.item.y - 1],
        [element.item.x + (element.item.y - 1) % 2, element.item.y - 1],

        [element.item.x + 1, element.item.y],
        [element.item.x - 1, element.item.y],

        [element.item.x - 1 + (element.item.y + 1) % 2, element.item.y + 1],
        [element.item.x + (element.item.y + 1) % 2, element.item.y + 1],
    ];

    actors.forEach(function(actor) {
        if(actor.name === 'hero' && actor.id === element.target_id) {
            nearby.forEach(function(coords){
                if(coords[0] === actor.x && coords[1] === actor.y) {
                    nearby_flag = true;
                }
            })
        }
    })
    //console.log(nearby_flag);
    return nearby_flag;
}

function toggleHeroRadius(active = true, radius = 1, x, y, element) {
    let temp_x = x;
    let temp_y = y;
    if(active) {
        temp_y = y - 1;
        if(temp_y > 0) {
            $("a[data-row='" + x + "'][data-num='" + temp_y + "']").addClass('accessible');
            $("a[data-row='" + x + "'][data-num='" + temp_y + "']").attr('data-link-accessible', element);
        }

        temp_y = y + 1;
        if(x % 2 == 1 && temp_y <= NUMS) {
            $("a[data-row='" + x + "'][data-num='" + temp_y + "']").addClass('accessible');  
            $("a[data-row='" + x + "'][data-num='" + temp_y + "']").attr('data-link-accessible', element);
        }
        if(x % 2 == 0 && temp_y <= NUMS - 1) {
            $("a[data-row='" + x + "'][data-num='" + temp_y + "']").addClass('accessible');  
            $("a[data-row='" + x + "'][data-num='" + temp_y + "']").attr('data-link-accessible', element);
        }        

        temp_x = x - 1;
        if(temp_x > 0) {
            temp_y = y - 1;
            $("a[data-row='" + temp_x + "'][data-num='" + (temp_y + temp_x % 2) + "']").addClass('accessible');
            $("a[data-row='" + temp_x + "'][data-num='" + (y + temp_x % 2) + "']").addClass('accessible');

            $("a[data-row='" + temp_x + "'][data-num='" + (temp_y + temp_x % 2) + "']").attr('data-link-accessible', element);
            $("a[data-row='" + temp_x + "'][data-num='" + (y + temp_x % 2) + "']").attr('data-link-accessible', element);
        }

        temp_x = x + 1;
        if(temp_x <= ROWS) {
            if(temp_x > 2) {
                $("a[data-row='" + temp_x + "'][data-num='" + (temp_y + temp_x % 2) + "']").addClass('accessible');
                $("a[data-row='" + temp_x + "'][data-num='" + (y + temp_x % 2) + "']").addClass('accessible');

                $("a[data-row='" + temp_x + "'][data-num='" + (temp_y + temp_x % 2) + "']").attr('data-link-accessible', element);
                $("a[data-row='" + temp_x + "'][data-num='" + (y + temp_x % 2) + "']").attr('data-link-accessible', element);
            } else {
                $("a[data-row='" + temp_x + "'][data-num='" + (temp_y - 1) + "']").addClass('accessible');
                $("a[data-row='" + temp_x + "'][data-num='" + (y - 1) + "']").addClass('accessible');      
                
                $("a[data-row='" + temp_x + "'][data-num='" + (temp_y - 1) + "']").attr('data-link-accessible', element);
                $("a[data-row='" + temp_x + "'][data-num='" + (y - 1) + "']").attr('data-link-accessible', element); 
            }         
        }
    } else {
        $("a").removeClass('accessible');
        $("a").removeAttr('data-link-accessible'); 
    }
}

function moveHero(x, y, link){
    $("a[data-link='" + link + "']").removeClass('hero').removeClass('active');
    $("a[data-link='" + link + "']").removeAttr('data-link');
    $("a[data-row='" + x + "'][data-num='" + y + "']").addClass('hero finished');
    $("a[data-row='" + x + "'][data-num='" + y + "']").attr('data-link', link); 
}

function moveMonster(x, y, x_new, y_new){
    let link = $("a[data-row='" + y + "'][data-num='" + x + "']").attr('data-link');
    $("a[data-row='" + y + "'][data-num='" + x + "']").removeClass('monster');
    $("a[data-row='" + y + "'][data-num='" + x + "']").removeAttr('data-link');
    $("a[data-row='" + y_new + "'][data-num='" + x_new + "']").addClass('monster');
    $("a[data-row='" + y_new + "'][data-num='" + x_new + "']").attr('data-link', link); ; 
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function getFight(element) {
    console.log(actors[element.target_id])
    actors[element.target_id].setHP(actors[element.target_id].hp-1)
    updateHPs()
}

function clearHeroClass() {
    $("#hexGrid a").removeClass('finished');
}

function updateTurns(turns) {
    $(".matches").html(turns);
}

function updateHPs() {
    $('.info_table tr:nth-child(2) td:nth-child(1)').text(stack[0].item.hp)
    $('.info_table tr:nth-child(2) td:nth-child(2)').text(stack[1].item.hp)
    //$('.info_table tr:nth-child(2) td:nth-child(3)').text(stack[2].item.hp)
}

function isOdd(num) { return num % 2;}

function left(element) {
    moveMonster(element.item.x, element.item.y, element.item.x - 1, element.item.y)
    element.item.setPositionX(element.item.x - 1)
}

function right(element) {
    moveMonster(element.item.x, element.item.y, element.item.x + 1, element.item.y)
    element.item.setPositionX(element.item.x + 1)
}

function bottom_right(element) {
    if(isOdd(element.item.y + 1)) {
        moveMonster(element.item.x, element.item.y, element.item.x + 1, element.item.y + 1)
        element.item.setPositionX(element.item.x + 1)
    } else {
        moveMonster(element.item.x, element.item.y, element.item.x, element.item.y + 1)
    }
    element.item.setPositionY(element.item.y + 1)
}

function bottom_left(element) {
    if(!isOdd(element.item.y + 1)) {
        moveMonster(element.item.x, element.item.y, element.item.x - 1, element.item.y + 1)
        element.item.setPositionX(element.item.x - 1)
    } else {
        moveMonster(element.item.x, element.item.y, element.item.x, element.item.y + 1)
    }
    element.item.setPositionY(element.item.y + 1)
}

function top_right(element) {
    if(element.item.y > 1) {
        if(isOdd(element.item.y - 1)) {
            moveMonster(element.item.x, element.item.y, element.item.x + 1, element.item.y - 1)
            element.item.setPositionX(element.item.x + 1)
        } else {
            moveMonster(element.item.x, element.item.y, element.item.x, element.item.y - 1)
        }
        element.item.setPositionY(element.item.y - 1);
    }
}

function top_left(element) {
    if(element.item.y > 1) {
        if(!isOdd(element.item.y - 1)) {
            moveMonster(element.item.x, element.item.y, element.item.x - 1, element.item.y - 1)
            element.item.setPositionX(element.item.x - 1)
        } else {
            moveMonster(element.item.x, element.item.y, element.item.x, element.item.y - 1)
        }
        element.item.setPositionY(element.item.y - 1)
    }
}