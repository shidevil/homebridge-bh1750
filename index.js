var Service;
var Characteristic;
var HomebridgeAPI;
var BH1750_Library = require('bh1750');

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomebridgeAPI = homebridge;

    homebridge.registerAccessory("homebridge-bh1750", "bh1750", BH1750);
};

function BH1750(log, config) {
    this.log = log;
    this.name = config.name;
    this.lightSensor = new BH1750_Library({});

    // info service
    this.informationService = new Service.AccessoryInformation();
        
    this.informationService
    .setCharacteristic(Characteristic.Manufacturer, "ROHM SEMICONDUCTOR")
    .setCharacteristic(Characteristic.Model, config.model || "BH1750")
    .setCharacteristic(Characteristic.SerialNumber, config.serial || "A7CE1720-540E-4CCF-800D-9049B941812F");




    // lux service

    this.service_lux = new Service.LightSensor(this.name);

    this.service_lux.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
        .setProps({ minValue: 0, maxValue: 65535, minStep: 4 })
        .on('get', this.getLux.bind(this));

    if (config.autoRefresh && config.autoRefresh > 0) {
        var that = this;
        setInterval(function() {
            that.lightSensor.readLight(function(err, value) {
                if (err) {
                    that.log("light error: " + err);
                    throw err;
                } else {
                    that.service_lux.getCharacteristic(Characteristic.CurrentAmbientLightLevel).setValue(value);
                    that.log("Refresh light value: ", value, "lx")
                }
            });
        }, config.autoRefresh * 1000);
    }
}

BH1750.prototype.getLux = function(cb) {
    var that = this;
    that.lightSensor.readLight(function(err, value){
    if (err) {
        that.log("light error: " + err);
        throw err;
    } else {
        that.log("light value is:", value, "lx");
        cb(null,value)
    }
});
};

BH1750.prototype.getServices = function() {
    return [this.informationService, this.service_lux];
};