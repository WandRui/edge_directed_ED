% Window-WPT micro energy router simulation for competition paper.
% Run in MATLAB. The numeric section works with base MATLAB; if Simulink is
% installed, the script also builds and saves a runnable model:
%   simulation/window_wpt_router.slx
clear; clc;

% Parameters
A = 1.5;                 % window area, m^2
eta_pv = 0.08;           % equivalent semi-transparent PV efficiency
k_loss = 0.85;           % angle/dust/aging factor
eta_mppt = 0.95;
eta_wpt = 0.70;
E_bat_Wh = 120;
SOC0 = 0.50;
P_load_A = 5;
P_load_BC = 10;

% Hourly irradiance/load profile, 8:00-18:00
time_h = (8:18)';
sim_time_h = (0:10)';
G = [100 300 550 750 850 800 650 450 250 80 0]';
loadBC = zeros(size(time_h));
loadBC(time_h >= 11 & time_h <= 15) = P_load_BC;

% Numeric energy-balance simulation
Ppv = G .* A .* eta_pv .* k_loss;
Pbus = Ppv .* eta_mppt;
loadA = P_load_A * ones(size(time_h));
PwptOut = loadA + loadBC;
PwptIn = PwptOut ./ eta_wpt;
E = SOC0 * E_bat_Wh;
SOC = zeros(size(time_h));
Etrace = zeros(size(time_h));
for k = 1:numel(time_h)
    E = min(E_bat_Wh, max(0, E + Pbus(k) - PwptIn(k))); % 1-hour step
    Etrace(k) = E;
    SOC(k) = 100 * E / E_bat_Wh;
end

T = table(time_h,G,Ppv,Pbus,loadA,loadBC,PwptIn,PwptOut,SOC,Etrace, ...
    'VariableNames',{'time_h','irradiance_W_m2','pv_power_W','mppt_bus_W', ...
    'load_A_W','load_BC_W','wpt_input_W','wpt_output_W','battery_soc_percent','battery_energy_Wh'});
disp(T);
writetable(T,'results.csv');

figure('Name','Window WPT Simulation Results');
tiledlayout(3,1);
nexttile; plot(time_h,G,'-o','LineWidth',1.5); ylabel('G (W/m^2)'); grid on;
nexttile; plot(time_h,Ppv,'-o',time_h,PwptOut,'-s','LineWidth',1.5); ylabel('Power (W)'); legend('PV','Wireless output'); grid on;
nexttile; plot(time_h,SOC,'-o','LineWidth',1.5); ylabel('SOC (%)'); xlabel('Hour'); grid on;

% Optional runnable Simulink model generation. Time unit is hour; each sample
% represents one hour, so power imbalance in W is numerically Wh per step.
if exist('new_system','file') == 2
    mdl = 'window_wpt_router';
    if bdIsLoaded(mdl), close_system(mdl,0); end
    new_system(mdl); open_system(mdl);
    set_param(mdl,'StopTime','10','Solver','FixedStepDiscrete','FixedStep','1');

    assignin('base','irradiance_profile',[sim_time_h G]);
    assignin('base','load_bc_profile',[sim_time_h loadBC]);
    assignin('base','pv_gain',A*eta_pv*k_loss);
    assignin('base','eta_mppt',eta_mppt);
    assignin('base','eta_wpt',eta_wpt);
    assignin('base','E_bat_Wh',E_bat_Wh);
    assignin('base','E0_Wh',SOC0*E_bat_Wh);

    add_block('simulink/Sources/From Workspace',[mdl '/Irradiance Profile'], ...
        'VariableName','irradiance_profile','Position',[35 70 165 100]);
    add_block('simulink/Math Operations/Gain',[mdl '/STPV Window Gain'], ...
        'Gain','pv_gain','Position',[215 65 315 105]);
    add_block('simulink/Math Operations/Gain',[mdl '/MPPT Efficiency'], ...
        'Gain','eta_mppt','Position',[365 65 475 105]);
    add_block('simulink/Sources/Constant',[mdl '/A Load 5W'], ...
        'Value','5','Position',[365 165 475 195]);
    add_block('simulink/Sources/From Workspace',[mdl '/BC Load Profile'], ...
        'VariableName','load_bc_profile','Position',[365 225 475 255]);
    add_block('simulink/Math Operations/Sum',[mdl '/Priority Load Sum'], ...
        'Inputs','++','Position',[525 180 555 240]);
    add_block('simulink/Math Operations/Gain',[mdl '/WPT Input Power'], ...
        'Gain','1/eta_wpt','Position',[600 195 710 225]);
    add_block('simulink/Math Operations/Sum',[mdl '/Energy Balance'], ...
        'Inputs','+-','Position',[770 90 800 210]);
    add_block('simulink/Discrete/Discrete-Time Integrator',[mdl '/Hybrid Storage Wh'], ...
        'InitialCondition','E0_Wh','SampleTime','1','LimitOutput','on', ...
        'UpperSaturationLimit','E_bat_Wh','LowerSaturationLimit','0', ...
        'Position',[845 120 975 165]);
    add_block('simulink/Math Operations/Gain',[mdl '/SOC Percent'], ...
        'Gain','100/E_bat_Wh','Position',[1020 120 1130 165]);
    add_block('simulink/Sinks/To Workspace',[mdl '/To Workspace SOC'], ...
        'VariableName','soc_simulink','SaveFormat','StructureWithTime', ...
        'Position',[1175 125 1295 160]);
    add_block('simulink/Sinks/Scope',[mdl '/Scope'], ...
        'Position',[1175 30 1295 90]);

    add_line(mdl,'Irradiance Profile/1','STPV Window Gain/1','autorouting','on');
    add_line(mdl,'STPV Window Gain/1','MPPT Efficiency/1','autorouting','on');
    add_line(mdl,'MPPT Efficiency/1','Energy Balance/1','autorouting','on');
    add_line(mdl,'A Load 5W/1','Priority Load Sum/1','autorouting','on');
    add_line(mdl,'BC Load Profile/1','Priority Load Sum/2','autorouting','on');
    add_line(mdl,'Priority Load Sum/1','WPT Input Power/1','autorouting','on');
    add_line(mdl,'WPT Input Power/1','Energy Balance/2','autorouting','on');
    add_line(mdl,'Energy Balance/1','Hybrid Storage Wh/1','autorouting','on');
    add_line(mdl,'Hybrid Storage Wh/1','SOC Percent/1','autorouting','on');
    add_line(mdl,'SOC Percent/1','To Workspace SOC/1','autorouting','on');
    add_line(mdl,'SOC Percent/1','Scope/1','autorouting','on');

    annotation = sprintf(['Model: PV window + WPT desktop router\n', ...
        'PV: P=G*A*eta*k, WPT input=Pload/eta_wpt\n', ...
        'Storage: E(k+1)=sat(E(k)+Pbus-PwptIn), unit Wh per 1 h step']);
    Simulink.Annotation([mdl '/Theory Note'],'Text',annotation,'Position',[35 305 640 390]);

    save_system(mdl,fullfile(pwd,'window_wpt_router.slx'));
    fprintf('Saved runnable Simulink model: %s\n', fullfile(pwd,'window_wpt_router.slx'));
end
