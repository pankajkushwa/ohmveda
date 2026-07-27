import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, Smartphone, Monitor, Activity, Zap, RefreshCw, Terminal, AlertTriangle, ShieldCheck, Play, Pause, Sliders } from 'lucide-react';
import { TelemetryState } from '../types';

export const IoTSimulator: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    powerOn: true,
    pinOutput: true,
    temperature: 28.5,
    humidity: 58.0,
    voltage: 3.32,
    vibration: 0.12,
    rssi: -64,
    sensorStatus: 'NOMINAL',
    lastMqttMessage: '{"node_id":"OHM-NODE-01","temp":28.5,"hum":58.0,"relay":1,"volt":3.32,"rssi":-64}',
    packetCount: 1420,
    batteryLevel: 94,
  });

  const [isAutoStreaming, setIsAutoStreaming] = useState(true);

  // Auto update telemetry periodically if power is ON and autoStreaming
  useEffect(() => {
    if (!telemetry.powerOn || !isAutoStreaming) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const tempVariation = (Math.random() - 0.48) * 0.4;
        const humVariation = (Math.random() - 0.5) * 0.6;
        const newTemp = Math.max(15, Math.min(65, +(prev.temperature + tempVariation).toFixed(1)));
        const newHum = Math.max(20, Math.min(90, +(prev.humidity + humVariation).toFixed(1)));
        const newVolt = +(3.3 + (Math.random() - 0.5) * 0.04).toFixed(2);
        const newVib = +(Math.random() * 0.25).toFixed(2);
        
        let status: 'NOMINAL' | 'WARNING' | 'ALERT' = 'NOMINAL';
        if (newTemp > 45 || newVib > 0.8) status = 'ALERT';
        else if (newTemp > 38 || newVib > 0.5) status = 'WARNING';

        const payload = JSON.stringify({
          node_id: 'OHM-NODE-01',
          temp: newTemp,
          hum: newHum,
          relay: prev.pinOutput ? 1 : 0,
          volt: newVolt,
          vib: newVib,
          rssi: prev.rssi,
          ts: Math.floor(Date.now() / 1000),
        });

        return {
          ...prev,
          temperature: newTemp,
          humidity: newHum,
          voltage: newVolt,
          vibration: newVib,
          sensorStatus: status,
          lastMqttMessage: payload,
          packetCount: prev.packetCount + 1,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [telemetry.powerOn, isAutoStreaming]);

  const togglePower = () => {
    setTelemetry((prev) => ({
      ...prev,
      powerOn: !prev.powerOn,
      pinOutput: !prev.powerOn ? true : false,
      sensorStatus: !prev.powerOn ? 'NOMINAL' : 'NOMINAL',
    }));
  };

  const toggleRelay = () => {
    if (!telemetry.powerOn) return;
    setTelemetry((prev) => {
      const nextRelay = !prev.pinOutput;
      const payload = JSON.stringify({
        node_id: 'OHM-NODE-01',
        cmd: 'SET_RELAY',
        state: nextRelay ? 1 : 0,
        temp: prev.temperature,
        hum: prev.humidity,
        ts: Math.floor(Date.now() / 1000),
      });
      return {
        ...prev,
        pinOutput: nextRelay,
        lastMqttMessage: payload,
        packetCount: prev.packetCount + 1,
      };
    });
  };

  return (
    <section id="simulator" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-blue-50 border border-blue-100 text-[11px] text-blue-700 font-bold uppercase tracking-[0.18em]">
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Live Interactive Demo</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Hardware-To-Cloud Telemetry Simulator
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Test OhmVeda’s hardware-to-app pipeline in real time! Interact with the simulated physical board below to see telemetry stream across MQTT, cloud backend, web dashboard, and mobile phone.
          </p>
        </div>

        {/* Live Simulator Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Simulated Hardware Board (PCB & Controls) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono text-blue-600 uppercase">Hardware Node // PCB-REV2</span>
                    <h3 className="text-base font-bold text-slate-900">STM32 / ESP32 Sensor Node</h3>
                  </div>
                </div>

                <button
                  onClick={togglePower}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    telemetry.powerOn
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{telemetry.powerOn ? 'MCU ONLINE' : 'POWER OFF'}</span>
                </button>
              </div>

              {/* Hardware Controls & Sliders */}
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      <span>GPIO Output Relay (Actuator)</span>
                    </span>
                    <button
                      onClick={toggleRelay}
                      disabled={!telemetry.powerOn}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        telemetry.pinOutput && telemetry.powerOn
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {telemetry.pinOutput && telemetry.powerOn ? 'RELAY HIGH (ON)' : 'RELAY LOW (OFF)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Simulates switching physical high-voltage relays, motors, or solenoid valves via microcontroller pin state.
                  </p>
                </div>

                {/* Sensor Inputs Sliders */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Adjust Simulated Temperature Sensor</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600">{telemetry.temperature} °C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    step="0.5"
                    value={telemetry.temperature}
                    disabled={!telemetry.powerOn}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTelemetry((prev) => ({
                        ...prev,
                        temperature: val,
                        sensorStatus: val > 45 ? 'ALERT' : val > 38 ? 'WARNING' : 'NOMINAL',
                      }));
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>15°C (Cool)</span>
                    <span>38°C (Warning)</span>
                    <span>65°C (Alert)</span>
                  </div>
                </div>

                {/* Board Indicators */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">3.3V Rail</span>
                    <span className="font-bold text-slate-900">{telemetry.powerOn ? `${telemetry.voltage} V` : '0.00 V'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Wi-Fi RSSI</span>
                    <span className="font-bold text-blue-600">{telemetry.powerOn ? `${telemetry.rssi} dBm` : 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Battery</span>
                    <span className="font-bold text-emerald-600">{telemetry.powerOn ? `${telemetry.batteryLevel}%` : '0%'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Packets Sent: {telemetry.packetCount}</span>
              <button
                onClick={() => setIsAutoStreaming(!isAutoStreaming)}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                {isAutoStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
              </button>
            </div>
          </div>

          {/* Middle Column: Cloud & MQTT Broker Pipeline Stream */}
          <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">Cloud & Protocol Layer</span>
                    <h3 className="text-base font-bold text-white">MQTT Broker & Express API</h3>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              {/* Live Terminal Log Stream */}
              <div className="mt-6 space-y-3">
                <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Real-Time Ingress JSON Stream</span>
                </span>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-blue-300 space-y-2 h-[220px] overflow-y-auto">
                  <p className="text-slate-500 text-[10px]">
                    [MQTT BROKER] Listening on tls://mqtt.ohmveda-tech.cloud:8883
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 break-all leading-relaxed">
                    <span className="text-slate-500 text-[10px] block mb-1">TOPIC: ohmveda/nodes/01/telemetry</span>
                    {telemetry.powerOn ? telemetry.lastMqttMessage : '{"status":"MCU_OFFLINE"}'}
                  </div>
                  
                  <div className="pt-2 text-[10px] text-slate-400 space-y-1">
                    <p className="flex justify-between">
                      <span>TLS 1.3 Encryption:</span> <span className="text-emerald-400">ACTIVE</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Express Endpoint:</span> <span className="text-blue-300">/api/v1/telemetry/ingest</span>
                    </p>
                    <p className="flex justify-between">
                      <span>DB Transaction:</span> <span className="text-cyan-300">PostgreSQL Committed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 text-center font-mono">
              [ Embedded Firmware ↔ Cloud REST / WS API Sync ]
            </div>
          </div>

          {/* Right Column: Web Dashboard & Android App UI Visualizers */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Frontends</span>
                    <h3 className="text-base font-bold text-slate-900">Web & Mobile Apps</h3>
                  </div>
                </div>
              </div>

              {/* Simulated Mobile Phone Screen */}
              <div className="mt-6 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Synchronized UI Views</span>
                </span>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Android App UI</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      telemetry.sensorStatus === 'ALERT'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {telemetry.sensorStatus}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Device Status</span>
                      <span className="text-slate-900 font-bold">{telemetry.powerOn ? 'Active Node' : 'Disconnected'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Live Temperature</span>
                      <span className="text-blue-600 font-bold font-mono">{telemetry.temperature} °C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Relay State</span>
                      <span className="text-emerald-600 font-bold font-mono">
                        {telemetry.pinOutput && telemetry.powerOn ? 'ACTIVE (HIGH)' : 'OFF (LOW)'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleRelay}
                    disabled={!telemetry.powerOn}
                    className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    App Remote Command: Toggle Relay
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 text-center font-medium">
              Complete end-to-end device & software integration built by OhmVeda.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
