asynctest(
  'Menu',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects'
  ],
 
  function (ApproxStructure, Assertions, Chain, NamedChain, Step, UiFinder, GuiFactory, SystemEvents, EventHandler, MenuEvents, GuiSetup, Objects) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'menu',

        value: 'test-menu-1',
        items: [
          { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
          { type: 'item', data: { value: 'beta', text: 'Beta' } }
        ],
        dom: {
          tag: 'div',
          classes: [ 'test-menu' ]
        },
        components: [
          { uiType: 'placeholder', name: '<alloy.menu.items>', owner: 'menu' }
        ],

        markers: {
          item: 'test-item',
          selectedItem: 'test-selected-item'
        },
        members: { 
          item: {
            munge: function (itemSpec) {
              return {
                dom: {
                  tag: 'div',
                  attributes: {
                    'data-value': itemSpec.data.value
                  },
                  classes: [ 'test-item' ],
                  innerHtml: itemSpec.data.text
                },
                components: [ ]
              };              
            }
          }
        },

        events: Objects.wrap(
          MenuEvents.focus(),
          EventHandler.nu({
            run: store.adder('menu.events.focus')
          })
        )
      });

    }, function (doc, body, gui, component, store) {
      // FIX: Flesh out test.
      var cAssertStructure = function (label, expected) {
        return Chain.op(function (element) {
          Assertions.assertStructure(label, expected, element);
        });
      };

      var cTriggerFocusItem = Chain.op(function (target) {
        component.getSystem().triggerEvent(SystemEvents.focusItem(), target, { });
      });

      var cAssertStore = function (label, expected) {
        return Chain.op(function () {
          store.assertEq(label, expected);
        });
      };

      var cClearStore = Chain.op(function () {
        store.clear();
      });

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.writeValue('menu', component.element()),
            NamedChain.direct('menu', UiFinder.cFindIn('div[data-value="alpha"]'), 'alpha'),
            NamedChain.direct('menu', UiFinder.cFindIn('div[data-value="beta"]'), 'beta'),

            cAssertStore('Before focusItem event', [ ]),

            NamedChain.direct('alpha', cTriggerFocusItem, '_'),

            NamedChain.direct('menu', cAssertStructure('After focusing item on alpha', ApproxStructure.build(function (s, str, arr) {
              return s.element('div', {
                classes: [
                  arr.has('test-menu')
                ],
                children: [
                  s.element('div', { classes: [ arr.has('test-selected-item') ] }),
                  s.element('div', { classes: [ arr.not('test-selected-item') ] })
                ]
              });
            })), '_'),

            cAssertStore('After focusItem event (alpha)', [ 'menu.events.focus' ]),

            cClearStore,
            NamedChain.direct('beta', cTriggerFocusItem, '_'),
            NamedChain.direct('menu', cAssertStructure('After focusing item on beta', ApproxStructure.build(function (s, str, arr) {
              return s.element('div', {
                classes: [
                  arr.has('test-menu')
                ],
                children: [
                  s.element('div', { classes: [ arr.not('test-selected-item') ] }),
                  s.element('div', { classes: [ arr.has('test-selected-item') ] })
                ]
              });
            })), '_'),
            cAssertStore('After focusItem event (beta)', [ 'menu.events.focus' ]),
            cClearStore
            
          ])
        ])
      ];
    }, function () { success(); }, failure);

  }
);