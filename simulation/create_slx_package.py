"""Create a lightweight SLX package placeholder for the Window-WPT model.

This repository environment does not include MATLAB/Simulink, so the authoritative
way to generate a fully release-specific runnable model is still
`window_wpt_simulation.m` inside MATLAB. This helper packages the model metadata,
block diagram intent, and generation script pointers into an `.slx` ZIP container
so the requested SLX artifact is present in the project.
"""
from __future__ import annotations

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "window_wpt_router.slx"

CONTENT_TYPES = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/simulink/blockdiagram.xml" ContentType="application/vnd.mathworks.simulink.blockDiagram+xml"/>
  <Override PartName="/metadata/coreProperties.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/metadata/mwcoreProperties.xml" ContentType="application/vnd.mathworks.package.coreProperties+xml"/>
</Types>
'''

RELS = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="blockDiagram" Target="simulink/blockdiagram.xml" Type="http://schemas.mathworks.com/simulink/2010/relationships/blockDiagram"/>
  <Relationship Id="coreProperties" Target="metadata/coreProperties.xml" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties"/>
</Relationships>
'''

CORE = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>window_wpt_router</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <dc:description>PV window and desktop wireless power routing model package. Run window_wpt_simulation.m in MATLAB/Simulink to regenerate a release-specific runnable SLX.</dc:description>
</cp:coreProperties>
'''

MWCORE = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<coreProperties xmlns="http://schemas.mathworks.com/package/2012/coreProperties">
  <contentType>Simulink.Model</contentType>
  <matlabRelease>R2024b</matlabRelease>
</coreProperties>
'''

BLOCKDIAGRAM = '''<?xml version="1.0" encoding="UTF-8"?>
<ModelInformation Version="1.0">
  <Model Name="window_wpt_router">
    <Description>PV window + MPPT/DC bus + hybrid storage + WPT router + priority loads.</Description>
    <Simulation StopTime="10" Solver="FixedStepDiscrete" FixedStep="1" TimeUnit="hour"/>
    <Parameters>
      <Parameter Name="A" Value="1.5" Unit="m^2"/>
      <Parameter Name="eta_pv" Value="0.08"/>
      <Parameter Name="k_loss" Value="0.85"/>
      <Parameter Name="eta_mppt" Value="0.95"/>
      <Parameter Name="eta_wpt" Value="0.70"/>
      <Parameter Name="E_bat_Wh" Value="120" Unit="Wh"/>
      <Parameter Name="SOC0" Value="0.50"/>
    </Parameters>
    <Blocks>
      <Block Name="Irradiance Profile" Type="From Workspace" Output="G(t)"/>
      <Block Name="STPV Window Gain" Type="Gain" Equation="Ppv=G*A*eta_pv*k_loss"/>
      <Block Name="MPPT Efficiency" Type="Gain" Equation="Pbus=eta_mppt*Ppv"/>
      <Block Name="Priority Load Sum" Type="Sum" Equation="Pload=P_A+P_BC"/>
      <Block Name="WPT Input Power" Type="Gain" Equation="PwptIn=Pload/eta_wpt"/>
      <Block Name="Energy Balance" Type="Sum" Equation="dE=Pbus-PwptIn"/>
      <Block Name="Hybrid Storage Wh" Type="Discrete-Time Integrator" Equation="E(k+1)=sat(E(k)+dE)"/>
      <Block Name="SOC Percent" Type="Gain" Equation="SOC=100*E/E_bat_Wh"/>
    </Blocks>
    <Connections>
      <Line From="Irradiance Profile" To="STPV Window Gain"/>
      <Line From="STPV Window Gain" To="MPPT Efficiency"/>
      <Line From="MPPT Efficiency" To="Energy Balance"/>
      <Line From="Priority Load Sum" To="WPT Input Power"/>
      <Line From="WPT Input Power" To="Energy Balance"/>
      <Line From="Energy Balance" To="Hybrid Storage Wh"/>
      <Line From="Hybrid Storage Wh" To="SOC Percent"/>
    </Connections>
  </Model>
</ModelInformation>
'''

with ZipFile(OUT, "w", ZIP_DEFLATED) as zf:
    zf.writestr("[Content_Types].xml", CONTENT_TYPES)
    zf.writestr("_rels/.rels", RELS)
    zf.writestr("metadata/coreProperties.xml", CORE)
    zf.writestr("metadata/mwcoreProperties.xml", MWCORE)
    zf.writestr("simulink/blockdiagram.xml", BLOCKDIAGRAM)
    zf.writestr("simulink/README.txt", "Run window_wpt_simulation.m in MATLAB/Simulink to regenerate a release-specific runnable SLX.\n")
print(f"created {OUT}")
