import React from "react";
import 'react-datepicker/dist/react-datepicker.css';
import Batteries from '../../dcomponents/Batteries';
import EVChargerOverview from '../evchargers';
import WheeledInSolar from "../../dcomponents/WheeledInSolar";
import PeakDemand from "../../dcomponents/PeakDemand";
import EnergyConsumption from "../../dcomponents/EnergyConsumption";
import MeterInfo from "../EnergyMeter";
import DieselGeneration from "../../dcomponents/DieselGeneration";
import HConsumption from "../../dcomponents/HConsumption";
import axios from 'axios';
import { useState, useEffect, useRef, useContext } from 'react';
import moment from 'moment-timezone';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DateContext } from "../../contexts/DateContext";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Edmc from "../../dcomponents/Edmc";
import ZoneUsage from "../../dcomponents/ZoneUsage";
import EnergySources from "../../dcomponents/EnergySources";



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
