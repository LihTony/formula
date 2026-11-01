/*
 * FORMULA Detailing — прайс-лист.
 * Все цены в белорусских рублях (BYN). Порядок цен: [седан, кроссовер, внедорожник/бус].
 * Чтобы изменить цену — правьте числа здесь; калькулятор и форма подхватят их сами.
 *   from: true  — цена «от»
 *   flat: true  — единая цена для всех кузовов
 *   roofRack: true — к услуге применяется доплата за багажник на крыше
 * ВАЖНО: цены «от …» на карточках раздела «Услуги» (index.html, id="services") заданы вручную —
 * при смене минимальной цены в категории обновите и их.
 */
(function (global) {
  'use strict';

  var DATA = {
    "BODY_TYPES": [
      {
        "id": "sedan",
        "short": "Седан",
        "label": "Седан, универсал, хэтчбек",
        "column": 0
      },
      {
        "id": "crossover",
        "short": "Кроссовер",
        "label": "Паркетник, кроссовер, внедорожник (2 ряда)",
        "column": 1
      },
      {
        "id": "suv",
        "short": "Внедорожник / Бус",
        "label": "Джип (3 ряда), микроавтобус, минивен, бус",
        "column": 2
      }
    ],
    "CATEGORIES": [
      {
        "id": "wash",
        "title": "Мойка / Кузов",
        "tagline": "От экспресса до детейлинг-мойки",
        "services": [
          {
            "id": "wash-express",
            "name": "Экспресс",
            "description": "Бесконтактная мойка кузова, ополаскивание, сушка",
            "prices": [
              14,
              16,
              18
            ],
            "roofRack": true
          },
          {
            "id": "wash-standard",
            "name": "Стандарт",
            "description": "Двухфазная мойка, ручная мойка кузова, коврики, сушка",
            "prices": [
              25,
              30,
              35
            ],
            "roofRack": true
          },
          {
            "id": "wash-quartz",
            "name": "Кварц",
            "description": "Стандарт + кварцевое покрытие кузова для блеска и защиты",
            "prices": [
              35,
              40,
              45
            ],
            "roofRack": true
          },
          {
            "id": "wash-detailing",
            "name": "Детейлинг-мойка",
            "description": "Тщательная ручная мойка с проработкой проёмов, дисков и деталей",
            "prices": [
              100,
              120,
              140
            ],
            "roofRack": true
          },
          {
            "id": "wash-moto",
            "name": "Мойка мотоцикла",
            "description": "Деликатная мойка мотоцикла",
            "prices": [
              25,
              25,
              25
            ],
            "flat": true
          }
        ]
      },
      {
        "id": "interior",
        "title": "Уборка / Салон",
        "tagline": "Чистота, которую чувствуешь",
        "services": [
          {
            "id": "int-complex",
            "name": "Комплексная уборка салона",
            "description": "Пылесос, влажная уборка пластика, стёкла изнутри",
            "prices": [
              25,
              30,
              35
            ]
          },
          {
            "id": "int-detailing",
            "name": "Детейлинг-уборка",
            "description": "Глубокая проработка каждой детали салона кистями и паром",
            "prices": [
              100,
              120,
              140
            ]
          },
          {
            "id": "int-vacuum",
            "name": "Пылесос",
            "description": "Сиденья, пол, багажник",
            "prices": [
              15,
              20,
              25
            ]
          },
          {
            "id": "int-wet",
            "name": "Влажная уборка",
            "description": "Панели, пластик, стёкла изнутри",
            "prices": [
              15,
              20,
              25
            ]
          },
          {
            "id": "int-dryclean",
            "name": "Комплексная химчистка салона",
            "description": "Сиденья, потолок, пол, багажник, карты дверей",
            "prices": [
              350,
              375,
              400
            ],
            "from": true
          }
        ]
      },
      {
        "id": "combo",
        "title": "Спецпредложения",
        "tagline": "Кузов + салон выгоднее",
        "services": [
          {
            "id": "combo-standard",
            "name": "Комплекс «Стандарт»",
            "description": "Мойка «Стандарт» + комплексная уборка салона",
            "prices": [
              40,
              50,
              60
            ],
            "roofRack": true
          },
          {
            "id": "combo-quartz",
            "name": "Комплекс «Кварц»",
            "description": "Мойка «Кварц» + комплексная уборка салона",
            "prices": [
              50,
              60,
              70
            ],
            "roofRack": true
          }
        ]
      },
      {
        "id": "extra",
        "title": "Дополнительно",
        "tagline": "Кузов и салон: защита и уход",
        "services": [
          {
            "id": "ex-turbo",
            "name": "Турбосушка",
            "prices": [
              5,
              5,
              7
            ]
          },
          {
            "id": "ex-tires",
            "name": "Чернение шин",
            "prices": [
              5,
              7,
              7
            ]
          },
          {
            "id": "ex-underbody",
            "name": "Мойка днища",
            "prices": [
              15,
              20,
              25
            ]
          },
          {
            "id": "ex-engine",
            "name": "Мойка подкапотного пространства",
            "prices": [
              20,
              25,
              30
            ]
          },
          {
            "id": "ex-bitumen",
            "name": "Удаление битума",
            "prices": [
              15,
              20,
              25
            ],
            "from": true
          },
          {
            "id": "ex-iron",
            "name": "Удаление металлических вкраплений",
            "prices": [
              30,
              40,
              50
            ],
            "from": true
          },
          {
            "id": "ex-wheels",
            "name": "Очистка дисков",
            "prices": [
              15,
              20,
              20
            ]
          },
          {
            "id": "ex-wax",
            "name": "Твёрдый воск",
            "prices": [
              30,
              40,
              50
            ]
          },
          {
            "id": "ex-ceramic",
            "name": "Керамика",
            "description": "Керамическое защитное покрытие кузова",
            "prices": [
              300,
              350,
              400
            ],
            "from": true
          },
          {
            "id": "ex-rain",
            "name": "Антидождь",
            "prices": [
              15,
              20,
              25
            ]
          },
          {
            "id": "ex-headlights",
            "name": "Полировка фар",
            "prices": [
              100,
              100,
              100
            ],
            "from": true,
            "flat": true
          },
          {
            "id": "ex-polish",
            "name": "Полировка кузова",
            "prices": [
              650,
              650,
              650
            ],
            "from": true,
            "flat": true
          },
          {
            "id": "ex-ozone",
            "name": "Озонирование салона",
            "prices": [
              50,
              50,
              50
            ],
            "flat": true
          }
        ]
      }
    ],
    "ROOF_RACK_SURCHARGE": 5
  };

  var ALL_SERVICES = [];
  DATA.CATEGORIES.forEach(function (c) { ALL_SERVICES = ALL_SERVICES.concat(c.services); });

  function columnOf(body) {
    for (var i = 0; i < DATA.BODY_TYPES.length; i++) {
      if (DATA.BODY_TYPES[i].id === body) return DATA.BODY_TYPES[i].column;
    }
    return 0;
  }

  function priceFor(service, body) {
    return service.prices[columnOf(body)];
  }

  function formatPrice(value, from) {
    return (from ? 'от ' : '') + value + ' руб';
  }

  function calcEstimate(serviceIds, body, roofRack) {
    var items = [];
    serviceIds.forEach(function (id) {
      var s = ALL_SERVICES.filter(function (x) { return x.id === id; })[0];
      if (s) items.push({ service: s, price: priceFor(s, body) });
    });
    var roofRackApplied = roofRack && items.some(function (i) { return i.service.roofRack; });
    var total = items.reduce(function (sum, i) { return sum + i.price; }, 0) +
      (roofRackApplied ? DATA.ROOF_RACK_SURCHARGE : 0);
    return {
      items: items,
      roofRackApplied: roofRackApplied,
      total: total,
      hasFrom: items.some(function (i) { return i.service.from; })
    };
  }

  global.FORMULA = {
    BODY_TYPES: DATA.BODY_TYPES,
    CATEGORIES: DATA.CATEGORIES,
    ROOF_RACK_SURCHARGE: DATA.ROOF_RACK_SURCHARGE,
    ALL_SERVICES: ALL_SERVICES,
    columnOf: columnOf,
    priceFor: priceFor,
    formatPrice: formatPrice,
    calcEstimate: calcEstimate
  };
})(window);
