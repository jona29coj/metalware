import React from "react";
import 'react-datepicker/dist/react-datepicker.css';
import Batteries from '../../dcomponents/Batteries';
import WaterStorage from '../WaterStorage';
import EVChargerOverview from '../evchargers';
import WheeledInSolar from "../../dcomponents/WheeledInSolar";
import PeakDemand from "../../dcomponents/PeakDemand";
import EnergyConsumption from "../../dcomponents/EnergyConsumption";
import ElectricityUsage from "../../dcomponents/ElectricityUsage";
import MeterInfo from "../EnergyMeter";
import DieselGeneration from "../../dcomponents/DieselGeneration";
import Edmc from "../../dcomponents/Edmc";
import ZoneUsage from "../../dcomponents/ZoneUsage";
import EnergySources from "../../dcomponents/EnergySources";

const EDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-3 gap-4">
      <Edmc />
      <div className="grid gap-4 custom:grid-cols-2 grid-cols-1">
  <ZoneUsage />
  <EnergySources />
</div>

      
      <ElectricityUsage />
      <MeterInfo />
      <DieselGeneration />
      <PeakDemand />
      <EnergyConsumption />
      <WheeledInSolar />
      <WaterStorage />
      <Batteries />
      <EVChargerOverview />
    </div>
  );
};

export default EDashboard;
