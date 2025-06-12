import React from "react";
import Batteries from '../../dcomponents/Batteries';
import EVChargerOverview from '../evchargers';
import WheeledInSolar from "../../dcomponents/WheeledInSolar";
import PeakDemand from "../../dcomponents/PeakDemand";
import MeterInfo from "../EnergyMeter";
import DieselGeneration from "../../dcomponents/DieselGeneration";
import HConsumption from "../../dcomponents/HConsumption";
import Edmc from "../../dcomponents/Edmc";
import ZoneUsage from "../../dcomponents/ZoneUsage";
import EnergySources from "../../dcomponents/EnergySources";
import EnergyConsumption from "../../dcomponents/EnergyConsumption";


const EDashboard = () => {
  return (
    <div className="flex flex-col bg-gray-100 p-3 gap-4">
      <div className="flex flex-col bg-gray-100 gap-4">
        <div className="mt-2">
          <Edmc />
        </div>
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2 relative">
          <ZoneUsage />
          <EnergySources />
        </div>
      </div>
      <HConsumption/>
      <MeterInfo />
      <PeakDemand />
      <EnergyConsumption />
      <DieselGeneration />
      <WheeledInSolar />
      <Batteries />
      <EVChargerOverview />
    </div>
  );
};

export default EDashboard;