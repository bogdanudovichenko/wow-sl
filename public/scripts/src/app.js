﻿document.addEventListener('DOMContentLoaded', function () {
    var tabs = [
        {
            displayValue: '2v2 Arena',
            value: '2v2'
        },
        {
            displayValue: '3v3 Arena',
            value: '3v3'
        },
        {
            displayValue: 'Battlegrounds',
            value: 'rbg'
        }
    ];

    var store = new Store({
        tabs: tabs,
        currentWowPvpBracket: '2v2',
        selectedWowClass: 'all',
        selectedWowSpec: 'all'
    });

    renderLadder(store);

    var bracketTabsControl = new TabsControl('#bracket-wrapper', {
        tabs: store.getState('tabs'),
        selectedValue: store.getState('currentWowPvpBracket'),
        onclick: function (ev) {
            store.setState('currentWowPvpBracket', ev.value);
        }
    });

    var classesDropDownControl = new DropDownControl('#wow-classes-drop-down-wrapper', {
        data: wowClassesList,
        selectedValue: store.getState('selectedWowClass'),
        onChange: function (value) {
            store.setMultipleStates([
                {
                    key: 'selectedWowClass',
                    value: value
                },
                {
                    key: 'selectedWowSpec',
                    value: 'all'
                }
            ]);
        }
    });

    function renderWowSpecDropDownList() {
        var selectedWowClass = store.getState('selectedWowClass');

        if (selectedWowClass && selectedWowClass !== 'all') {
            document.getElementById('wow-specs-drop-down-wrapper').style.display = '';
;
            var wowSpecsList = _.filter(wowClassesList, function (wc) { return wc.value === selectedWowClass })[0].specs;
            var selectedWowSpec = store.getState('selectedWowSpec');

            var specsDropDownList = new DropDownControl('#wow-specs-drop-down-wrapper', {
                data: wowSpecsList,
                selectedValue: selectedWowSpec,
                onChange: function (value) {
                    store.setState('selectedWowSpec', value);
                }
            });
        } else {
            document.getElementById('wow-specs-drop-down-wrapper').style.display = 'none';
        }
    }

    renderWowSpecDropDownList();

    store.addOnChangeEventListener(function (ev) {
        renderLadder(ev.store);
        renderWowSpecDropDownList();
    });

    function renderLadder(store) {
        var state = store.getAllState();

        var params = {
            pvpBracket: state.currentWowPvpBracket,
            wowclass: state.selectedWowClass,
            specid: state.selectedWowSpec
        };

        var url = apiService.formUrlForLadderGrid(params);

        var gridControl = new GridControl('#content-ladder-wrapper', {
            url: url,
            onDataBound: function(data) {
                if(!data || !Array.isArray(data) || !data.length) {
                    return;
                }
                
                var downloadedOnStr = data[0].downloadedOn;
                var downloadedOn = new Date(downloadedOnStr);

                document.getElementById('last-update').textContent = downloadedOn.toLocaleString();
            },
            tableHeaders: [
                {
                    displayName: '№',
                    logicalName: 'ranking'
                },
                {
                    displayName: 'Name',
                    logicalName: 'name',
                    template: function (val, item) {
                        var url = 'https://worldofwarcraft.com/en-gb/character/' + item.realmName.replace(' ', '-').replace('\'', '') + '/' + val;
                        url = decodeURIComponent(url);

                        var link = document.createElement('a');
                        link.classList.add('wow-class-name-link');
                        link.href = url;
                        link.innerHTML = '<span class="wow-class-name" style="color:' + wowClassesList[item.classId].color + ';">' + val + '</span>'

                        return link.outerHTML;
                    }
                },
                {
                    displayName: 'Spec',
                    logicalName: 'specId',
                    template: function (val, item) {
                        var specs = _.filter(wowClassesList, function (wc) { return wc.value === item.classId; })[0].specs;
                        var spec = _.filter(specs, function (s) {
                            return s.value == val;
                        })[0]

                        if (spec) {
                            return spec.displayValue;
                        }

                        return val;
                    }
                },
                {
                    displayName: 'Realm',
                    logicalName: 'realmName'
                },
                {
                    displayName: 'Rating',
                    logicalName: 'rating'
                }
            ]
        });
    }
});

function getBlizzardLocaleStr(locale) {
    switch (locale) {
        case 1:
            return 'en-us';
        case 0:
            return 'en-gb'
    }
}