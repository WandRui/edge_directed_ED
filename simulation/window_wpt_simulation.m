% Window-WPT micro energy router simulation for competition paper.
% Run in MATLAB. If Simulink is installed, the script creates a block-diagram
% model named window_wpt_router.slx; it also plots the numerical results.
clear; clc;

% Parameters
A = 1.5;                 % window area, m^2
eta_pv = 0.08;           % equivalent semi-transparent PV efficiency
k_loss = 0.85;           % angle/dust/aging factor
eta_mppt = 0.95;
eta_wpt = 0.70;
E_bat_Wh = 120;
SOC0 = 0.50;

time_h = (8:18)';
G = [100 300 550 750 850 800 650 450 250 80 0]';
Ppv = G .* A .* eta_pv .* k_loss;
Pbus = Ppv .* eta_mppt;
loadA = 5 * ones(size(time_h));
loadBC = zeros(size(time_h));
loadBC(time_h >= 11 & time_h <= 15) = 10;
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

% Optional Simulink block diagram generation
if exist('new_system','file') == 2
    mdl = 'window_wpt_router';
    if bdIsLoaded(mdl), close_system(mdl,0); end
    new_system(mdl); open_system(mdl);
    blocks = {'Irradiance Profile','STPV Window','MPPT & DC Bus','Hybrid Storage','WPT Router','Priority Loads'};
    x = 40;
    for i = 1:numel(blocks)
        add_block('simulink/Ports & Subsystems/Subsystem',[mdl '/' blocks{i}], ...
            'Position',[x 80 x+120 140]);
        if i > 1
            add_line(mdl,[blocks{i-1} '/1'],[blocks{i} '/1'],'autorouting','on');
        end
        x = x + 170;
    end
    set_param(mdl,'StopTime','10');
    save_system(mdl,'window_wpt_router.slx');
end
