import React from "react";
import 'react-datepicker/dist/react-datepicker.css';
import Batteries from '../../dcomponents/Batteries';
import WaterStorage from '../WaterStorage';
import EVChargerOverview from '../evchargers';
import WheeledInSolar from "../../dcomponents/WheeledInSolar";
import PeakDemand from "../../dcomponents/PeakDemand";
import EnergyConsumption from "../../dcomponents/EnergyConsumption";
import MeterInfo from "../EnergyMeter";
import DieselGeneration from "../../dcomponents/DieselGeneration";
import Edmc from "../../dcomponents/Edmc";
import ZoneUsage from "../../dcomponents/ZoneUsage";
import EnergySources from "../../dcomponents/EnergySources";
import HConsumption from "../../dcomponents/HConsumption";

const EDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-3 gap-4">
      <div className="lg:h-[20vh]" id="Facility Information Consumption Peak Demand Cost of Electricity Today's Total Cost Carbon Footprint">
      <Edmc />
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 relative" id="Zone Usage Consumption">
        <ZoneUsage />
        <EnergySources />
      </div>
      <div id="Hourly Consumption"><HConsumption/></div>
      <div id="Energy Meters"><MeterInfo /></div>
      <div id="Peak Demand"><PeakDemand /></div>
      <div id="Daily Consumption"><EnergyConsumption /></div>
      <div><DieselGeneration /></div>
      <WheeledInSolar />
      <Batteries />
      <EVChargerOverview />
    </div>
  );
};

export default EDashboard;
