EESchema Schematic File Version 2
LIBS:power
LIBS:device
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:ESP8266
LIBS:pololu
LIBS:rx5808
LIBS:bd93291efj
LIBS:cmt-1603-smt-tr
LIBS:74lvc1g3157
LIBS:dc-dc
LIBS:74xgxx
LIBS:ac-dc
LIBS:actel
LIBS:Altera
LIBS:analog_devices
LIBS:brooktre
LIBS:cmos_ieee
LIBS:diode
LIBS:elec-unifil
LIBS:ESD_Protection
LIBS:ftdi
LIBS:gennum
LIBS:graphic
LIBS:hc11
LIBS:ir
LIBS:Lattice
LIBS:logo
LIBS:maxim
LIBS:microchip_dspic33dsc
LIBS:microchip_pic10mcu
LIBS:microchip_pic12mcu
LIBS:microchip_pic16mcu
LIBS:microchip_pic18mcu
LIBS:microchip_pic32mcu
LIBS:motor_drivers
LIBS:msp430
LIBS:nordicsemi
LIBS:nxp_armmcu
LIBS:onsemi
LIBS:Oscillators
LIBS:Power_Management
LIBS:powerint
LIBS:pspice
LIBS:references
LIBS:relays
LIBS:rfcom
LIBS:sensors
LIBS:silabs
LIBS:stm8
LIBS:stm32
LIBS:supertex
LIBS:switches
LIBS:transf
LIBS:ttl_ieee
LIBS:video
LIBS:Xicor
LIBS:Zilog
LIBS:ap7333
LIBS:sma
LIBS:Chickadee-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 3 3
Title ""
Date ""
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L SW_PUSH SW1
U 1 1 5615B5FF
P 5100 3900
F 0 "SW1" H 5250 4010 50  0000 C CNN
F 1 "SW_PUSH" H 5100 3820 50  0000 C CNN
F 2 "Buttons_Switches_SMD:SW_SPST_PTS645" H 5100 3900 60  0001 C CNN
F 3 "" H 5100 3900 60  0000 C CNN
	1    5100 3900
	1    0    0    -1  
$EndComp
$Comp
L C C1
U 1 1 5615B641
P 5100 4200
F 0 "C1" H 5125 4300 50  0000 L CNN
F 1 "0.1uF" H 5125 4100 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603_HandSoldering" H 5138 4050 30  0001 C CNN
F 3 "" H 5100 4200 60  0000 C CNN
	1    5100 4200
	0    1    1    0   
$EndComp
$Comp
L GNDPWR #PWR040
U 1 1 5615B692
P 4800 4550
F 0 "#PWR040" H 4800 4350 50  0001 C CNN
F 1 "GNDPWR" H 4800 4420 50  0000 C CNN
F 2 "" H 4800 4500 60  0000 C CNN
F 3 "" H 4800 4500 60  0000 C CNN
	1    4800 4550
	1    0    0    -1  
$EndComp
Text HLabel 5400 4550 3    60   Input ~ 0
RESET
$Comp
L C C2
U 1 1 56161A55
P 6950 3800
F 0 "C2" H 6975 3900 50  0000 L CNN
F 1 "2.2uF" H 6975 3700 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603_HandSoldering" H 6988 3650 30  0001 C CNN
F 3 "" H 6950 3800 60  0000 C CNN
	1    6950 3800
	1    0    0    -1  
$EndComp
$Comp
L R R1
U 1 1 56161A89
P 6000 3250
F 0 "R1" V 6080 3250 50  0000 C CNN
F 1 "470k" V 6000 3250 50  0000 C CNN
F 2 "Resistors_SMD:R_0603_HandSoldering" V 5930 3250 30  0001 C CNN
F 3 "" H 6000 3250 30  0000 C CNN
	1    6000 3250
	1    0    0    -1  
$EndComp
$Comp
L R R2
U 1 1 56161B4F
P 6450 3550
F 0 "R2" V 6530 3550 50  0000 C CNN
F 1 "100k" V 6450 3550 50  0000 C CNN
F 2 "Resistors_SMD:R_0603_HandSoldering" V 6380 3550 30  0001 C CNN
F 3 "" H 6450 3550 30  0000 C CNN
	1    6450 3550
	0    1    1    0   
$EndComp
Text HLabel 7900 3200 2    60   Input ~ 0
GPIO0
$Comp
L GNDPWR #PWR041
U 1 1 56161C1C
P 7600 4400
F 0 "#PWR041" H 7600 4200 50  0001 C CNN
F 1 "GNDPWR" H 7600 4270 50  0000 C CNN
F 2 "" H 7600 4350 60  0000 C CNN
F 3 "" H 7600 4350 60  0000 C CNN
	1    7600 4400
	1    0    0    -1  
$EndComp
$Comp
L GNDPWR #PWR042
U 1 1 56161C45
P 6950 4400
F 0 "#PWR042" H 6950 4200 50  0001 C CNN
F 1 "GNDPWR" H 6950 4270 50  0000 C CNN
F 2 "" H 6950 4350 60  0000 C CNN
F 3 "" H 6950 4350 60  0000 C CNN
	1    6950 4400
	1    0    0    -1  
$EndComp
$Comp
L GNDPWR #PWR043
U 1 1 56161C6E
P 6000 4400
F 0 "#PWR043" H 6000 4200 50  0001 C CNN
F 1 "GNDPWR" H 6000 4270 50  0000 C CNN
F 2 "" H 6000 4350 60  0000 C CNN
F 3 "" H 6000 4350 60  0000 C CNN
	1    6000 4400
	1    0    0    -1  
$EndComp
$Comp
L +3.3V #PWR044
U 1 1 56161CF8
P 6000 3100
F 0 "#PWR044" H 6000 2950 50  0001 C CNN
F 1 "+3.3V" H 6000 3240 50  0000 C CNN
F 2 "" H 6000 3100 60  0000 C CNN
F 3 "" H 6000 3100 60  0000 C CNN
	1    6000 3100
	1    0    0    -1  
$EndComp
Wire Wire Line
	4800 3900 4800 4550
Wire Wire Line
	4950 4200 4800 4200
Connection ~ 4800 4200
Wire Wire Line
	5400 3900 5400 4550
Wire Wire Line
	5250 4200 5400 4200
Connection ~ 5400 4200
Wire Wire Line
	6600 3550 7300 3550
Wire Wire Line
	6950 3650 6950 3550
Connection ~ 6950 3550
Wire Wire Line
	6000 3400 6000 3700
Wire Wire Line
	6300 3550 6000 3550
Connection ~ 6000 3550
Wire Wire Line
	5400 3900 5700 3900
Wire Wire Line
	7600 3350 7600 3200
Wire Wire Line
	7600 3200 7900 3200
Wire Wire Line
	7600 3750 7600 4400
Wire Wire Line
	6950 3950 6950 4400
Wire Wire Line
	6000 4100 6000 4400
$Comp
L Q_NMOS_GSD Q1
U 1 1 563A7E46
P 5900 3900
F 0 "Q1" H 6200 3950 50  0000 R CNN
F 1 "Q_NMOS_GSD" H 6550 3850 50  0000 R CNN
F 2 "Housings_SOT-23_SOT-143_TSOT-6:SOT-23_Handsoldering" H 6100 4000 29  0001 C CNN
F 3 "" H 5900 3900 60  0000 C CNN
	1    5900 3900
	1    0    0    -1  
$EndComp
$Comp
L Q_NMOS_GSD Q2
U 1 1 563A7EF9
P 7500 3550
F 0 "Q2" H 7800 3600 50  0000 R CNN
F 1 "Q_NMOS_GSD" H 8150 3500 50  0000 R CNN
F 2 "Housings_SOT-23_SOT-143_TSOT-6:SOT-23_Handsoldering" H 7700 3650 29  0001 C CNN
F 3 "" H 7500 3550 60  0000 C CNN
	1    7500 3550
	1    0    0    -1  
$EndComp
$EndSCHEMATC
