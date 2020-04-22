let char = null;

function connect() {
    LED3.write(1);
    LED2.write(0);
    LED1.write(0);
    var gatt;
    NRF.requestDevice({ filters: [{ name: 'Espruino ID205L' }] }).then(function (device) {
        LED3.write(0);
        LED1.write(1);
        return device.gatt.connect();
    }).then(function (g) {
        LED1.write(0);
        LED3.write(1);
        gatt = g;
        return gatt.getPrimaryService("3e440001-f5bb-357d-719d-179272e4d4d9");
    }).then(function (service) {
        LED3.write(0);
        LED1.write(1);
        return service.getCharacteristic("3e440002-f5bb-357d-719d-179272e4d4d9");
    }).then(function (characteristic) {
        LED1.write(0);
        LED2.write(1);
        char = characteristic;
    });
}

setWatch((e) => {
    if (e.state) {
        if (!char) {
            connect();
        } else {
            char.writeValue(Math.random() * 0xff);
        }
    } else {
        if ((e.time - e.lastTime) > 2) {
            E.reboot();
        }
    }
}, BTN1, { edge: 'both', repeat: true });