# 参赛材料文件清单（无二进制版）

本仓库已移除二进制文件，只保留可直接查看、复制和修改的文本/脚本/数据文件。补强后的获奖定位、理论推导和符号单位说明已经合并到主论文中。

建议提交或发送以下文件：

1. `docs/entry_paper.md`：完整参赛论文正文，少于6000字；每个展示公式后都另起一行写明符号含义和单位。
2. `docs/theory_appendix.md`：兼容说明，说明补强内容已合并进主论文。
3. `simulation/window_wpt_simulation.m`：MATLAB数值仿真脚本；本地安装Simulink时运行它可生成`window_wpt_router.slx`。
4. `simulation/results.csv`：仿真结果数据，可直接放入论文表格或答辩PPT。
5. `simulation/simulink_block_diagram.svg`：汇报可用的Simulink等效框图，属于文本格式SVG。
6. `simulation/create_slx_package.py`：可选辅助脚本；若确实需要`.slx`后缀文件，可在本地运行生成，但仓库中不再提交生成后的二进制文件。

使用建议：论文交`docs/entry_paper.md`；答辩展示用`simulation/simulink_block_diagram.svg`和`simulation/results.csv`；若老师要求`.slx`文件，请在MATLAB中运行`simulation/window_wpt_simulation.m`现场生成。
