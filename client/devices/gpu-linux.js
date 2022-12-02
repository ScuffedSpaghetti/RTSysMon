//@ts-check
var fs = require("fs")
var path = require("path")

//linux drm
//current power draw in watts if divided by 1,000,000: hwmon/hwmon2/power1_average
//current max power draw in watts if divided by 1,000,000: hwmon/hwmon2/power1_cap
//fan max speed: hwmon/hwmon2/fan1_max
//fan target speed: hwmon/hwmon2/fan1_target
//current temp in deg C if divided by 1,000: hwmon/hwmon2/temp1_input
//gpu utilization percent: gpu_busy_percent
//vram used: mem_info_vram_used
//vram total: mem_info_vram_total
//	use link speed and width to determine pcie gen. ex: if speed = 16.0GT/s and width = 16 the pcie 3.0 16x used
//current pcie link speed: current_link_speed
//current pcie link width: current_link_width
//max pcie link speed: max_link_speed
//max pcie link width: max_link_width
//	should work and return something like 'AMD Radeon HD 7800' but doesn't work with current installed amd pu drivers
//product name: product_name
//device id: device (can be used with an array to find the card name ex. 0x73ff)
//driver: uevent (could use instead of name if one can't bb found ex. amdgpu)

var gpuIDTable = {
	"0x1638": {
	  "Graphics card": "AMD Ryzen 5000"
	},
	"0x66AF": {
	  "Graphics card": "AMD Radeon VII"
	},
	"0x6861": {
	  "Graphics card": "AMD Radeon Pro WX 9100"
	},
	"0x6868": {
	  "Graphics card": "AMD Radeon Pro WX 8200"
	},
	"0x67C4": {
	  "Graphics card": "AMD Radeon Pro WX 7100"
	},
	"0x67C0": {
	  "Graphics card": "AMD Radeon Pro WX 7100"
	},
	"0x67C7": {
	  "Graphics card": "AMD Radeon Pro WX 5100"
	},
	"0x67E8": {
	  "Graphics card": "AMD Radeon Pro WX 4150"
	},
	"0x67E3": {
	  "Graphics card": "AMD Radeon Pro WX 4100"
	},
	"0x6981": {
	  "Graphics card": "AMD Radeon Pro WX 3200 Graphics"
	},
	"0x6985": {
	  "Graphics card": "AMD Radeon Pro WX 2100 Graphics"
	},
	"0x6995": {
	  "Graphics card": "AMD Radeon Pro WX 2100"
	},
	"0x67A1": {
	  "Graphics card": "AMD FirePro W8100"
	},
	"0x692B": {
	  "Graphics card": "AMD FirePro W7100"
	},
	"0x682C": {
	  "Graphics card": "AMD FirePro W4100"
	},
	"0x6608": {
	  "Graphics card": "AMD FirePro W2100"
	},
	"0x7310": {
	  "Graphics card": "AMD Radeon Pro W5700X"
	},
	"0x7312": {
	  "Graphics card": "AMD Radeon Pro W5700"
	},
	"0x7341": {
	  "Graphics card": "AMD Radeon Pro W5500"
	},
	"0x731B": {
	  "Graphics card": "AMD Radeon Pro 5700"
	},
	"0x7319": {
	  "Graphics card": "AMD Radeon Pro 5700 XT"
	},
	"0x7360": {
	  "Graphics card": "AMD Radeon Pro 5600M"
	},
	"0x7340": {
	  "Graphics card": "AMD Radeon Pro 5500M / 5300M"
	},
	"0x73AF": {
	  "Graphics card": "AMD Radeon RX 6900 XT"
	},
	"0x73BF": {
	  "Graphics card": "AMD Radeon RX 6800 XT"
	},
	"0x73DF": {
	  "Graphics card": "AMD Radeon RX 6700 XT"
	},
	"0x73FF": {
	  "Graphics card": "AMD Radeon RX 6600M"
	},
	"0x731F": {
	  "Graphics card": "AMD Radeon RX 5700 / 5700 XT"
	},
	"0xAAF0": {
	  "Graphics card": "AMD Radeon RX 580"
	},
	"0x6FDF": {
	  "Graphics card": "AMD Radeon RX 580 2048SP"
	},
	"0x6987": {
	  "Graphics card": "AMD Radeon RX 540X Series"
	},
	"0x699F": {
	  "Graphics card": "AMD Radeon RX 540"
	},
	"0x15D8": {
	  "Graphics card": "AMD Vega 11/10"
	},
	"0x15DD": {
	  "Graphics card": "AMD Vega 8"
	},
	"0x15FF": {
	  "Graphics card": "AMD Radeon Vega 28 Mobile"
	},
	"0x1636": {
	  "Graphics card": "AMD Renoir 4000 Seires APU"
	},
	"0x66A3": {
	  "Graphics card": "AMD Radeon Pro Vega II"
	},
	"0x6863": {
	  "Graphics card": "AMD Vega FE"
	},
	"0x687F": {
	  "Graphics card": "AMD Vega 64 and 56"
	},
	"0x694C": {
	  "Graphics card": "AMD Radeon RX Vega M GH Graphics"
	},
	"0x694E": {
	  "Graphics card": "AMD Radeon RX Vega M GL"
	},
	"0x694F": {
	  "Graphics card": "AMD Radeon Pro WX Vega M GL Graphics"
	},
	"0x69AF": {
	  "Graphics card": "AMD Radeon Pro Vega 16"
	},
	"0x6869": {
	  "Graphics card": "AMD Radeon Pro Vega 48"
	},
	"0x6867": {
	  "Graphics card": "AMD Radeon Pro Vega 56"
	},
	"0x6860": {
	  "Graphics card": "AMD Radeon Pro Vega 64"
	},
	"0x686B": {
	  "Graphics card": "AMD Radeon Pro Vega 64X"
	},
	"0x686C": {
	  "Graphics card": "AMD Radeon Instinct MI25 MxGPU"
	},
	"0x67DF": {
	  "Graphics card": "AMD Radeon R9 480"
	},
	"0x67FF": {
	  "Graphics card": "AMD Radeon R9 560 4GB"
	},
	"0x67EF": {
	  "Graphics card": "AMD Radeon R9 450 and 460"
	},
	"0xAAE8": {
	  "Graphics card": "AMD Radeon R9 Fury + Fury X"
	},
	"0x7300": {
	  "Graphics card": "AMD Radeon R9 Fury X"
	},
	"0x67B1": {
	  "Graphics card": "AMD Radeon R9 390 and 200 Series"
	},
	"0x6939": {
	  "Graphics card": "AMD Radeon R9 380"
	},
	"0x6810": {
	  "Graphics card": "AMD Radeon R9 370 and 8800 Series"
	},
	"0x665C": {
	  "Graphics card": "AMD Radeon R9 360"
	},
	"0x6938": {
	  "Graphics card": "AMD Radeon HD R295X"
	},
	"0x67B0": {
	  "Graphics card": "AMD Radeon HD R290 X2"
	},
	"0x6646": {
	  "Graphics card": "AMD Radeon HD R280 X"
	},
	"0x67B9": {
	  "Graphics card": "AMD Radeon HD R280"
	},
	"0xAAA0": {
	  "Graphics card": "AMD Radeon R9 280X"
	},
	"0x6835": {
	  "Graphics card": "AMD Radeon R9 255"
	},
	"0x6658": {
	  "Graphics card": "AMD Radeon R7 200 Series"
	},
	"0x6617": {
	  "Graphics card": "AMD Radeon R7 240"
	},
	"0x67B8": {
	  "Graphics card": "HAWAII XT"
	},
	"0x6801": {
	  "Graphics card": "AMD Radeon(TM) HD8970M"
	},
	"0x6822": {
	  "Graphics card": "AMD Radeon E8860"
	},
	"0x6820": {
	  "Graphics card": "AMD Radeon HD 8800M Series"
	},
	"0x6821": {
	  "Graphics card": "AMD Radeon HD 8800M Series"
	},
	"0x6823": {
	  "Graphics card": "AMD Radeon HD 8800M Series"
	},
	"0x682B": {
	  "Graphics card": "AMD Radeon HD 8800M Series"
	},
	"0x6606": {
	  "Graphics card": "AMD Radeon HD 8790M"
	},
	"0x6600": {
	  "Graphics card": "AMD Radeon HD 8600/8700M"
	},
	"0x6601": {
	  "Graphics card": "AMD Radeon (TM) HD 8500M/8700M"
	},
	"0x6610": {
	  "Graphics card": "AMD Radeon HD 8500/8600 Series"
	},
	"0x6611": {
	  "Graphics card": "AMD Radeon HD 8500/8600 Series"
	},
	"0x6613": {
	  "Graphics card": "AMD Radeon HD 8500/8600 Series"
	},
	"0x990C": {
	  "Graphics card": "AMD Radeon HD 8670D"
	},
	"0x999C": {
	  "Graphics card": "AMD Radeon HD 8650D"
	},
	"0x990B": {
	  "Graphics card": "AMD Radeon HD 8650G"
	},
	"0x990F": {
	  "Graphics card": "AMD Radeon HD 8610G"
	},
	"0x6660": {
	  "Graphics card": "AMD Radeon HD 8600M Series"
	},
	"0x999D": {
	  "Graphics card": "AMD Radeon HD 8550D"
	},
	"0x990D": {
	  "Graphics card": "AMD Radeon HD 8550G"
	},
	"0x990E": {
	  "Graphics card": "AMD Radeon HD 8570D"
	},
	"0x6607": {
	  "Graphics card": "AMD Radeon (TM) HD8530M"
	},
	"0x9999": {
	  "Graphics card": "AMD Radeon HD 8510G"
	},
	"0x6663": {
	  "Graphics card": "AMD Radeon HD 8500M Series"
	},
	"0x6771": {
	  "Graphics card": "AMD Radeon(TM) HD8490"
	},
	"0x9996": {
	  "Graphics card": "AMD Radeon HD 8470D"
	},
	"0x9995": {
	  "Graphics card": "AMD Radeon HD 8450G"
	},
	"0x999A": {
	  "Graphics card": "AMD Radeon HD 8410G"
	},
	"0x9830": {
	  "Graphics card": "AMD Radeon HD 8400"
	},
	"0x9831": {
	  "Graphics card": "AMD Radeon HD 8400E"
	},
	"0x9998": {
	  "Graphics card": "AMD Radeon HD 8370D"
	},
	"0x9997": {
	  "Graphics card": "AMD Radeon HD 8350G"
	},
	"0x9832": {
	  "Graphics card": "AMD Radeon HD 8330"
	},
	"0x9833": {
	  "Graphics card": "AMD Radeon HD 8330E"
	},
	"0x999B": {
	  "Graphics card": "AMD Radeon HD 8310G"
	},
	"0x9836": {
	  "Graphics card": "AMD Radeon HD 8280"
	},
	"0x9837": {
	  "Graphics card": "AMD Radeon HD 8280E"
	},
	"0x983D": {
	  "Graphics card": "AMD Radeon HD 8250"
	},
	"0x9838": {
	  "Graphics card": "AMD Radeon HD 8240"
	},
	"0x9834": {
	  "Graphics card": "AMD Radeon HD 8210"
	},
	"0x9835": {
	  "Graphics card": "AMD Radeon HD 8210E"
	},
	"0x9839": {
	  "Graphics card": "AMD Radeon HD 8180"
	},
	"0x6647": {
	  "Graphics card": "AMD Radeon(TM) R9 M470"
	},
	"0x6921": {
	  "Graphics card": "AMD Radeon(TM) R9 M395X"
	},
	"0x6920": {
	  "Graphics card": "AMD Radeon(TM) R9 M395 Graphics"
	},
	"0x1309": {
	  "Graphics card": "AMD Radeon(TM) R7 Graphics"
	},
	"0x130C": {
	  "Graphics card": "AMD Radeon(TM) R7 Graphics"
	},
	"0x130F": {
	  "Graphics card": "AMD Radeon(TM) R7 Graphics"
	},
	"0x1313": {
	  "Graphics card": "AMD Radeon(TM) R7 Graphics"
	},
	"0x131C": {
	  "Graphics card": "AMD Radeon(TM) R7 Graphics"
	},
	"0x6605": {
	  "Graphics card": "AMD Radeon(TM) R7 M260"
	},
	"0x6900": {
	  "Graphics card": "AMD Radeon(TM) R7 M260"
	},
	"0x665F": {
	  "Graphics card": "AMD Radeon(TM) R7 M360"
	},
	"0x6604": {
	  "Graphics card": "AMD Radeon(TM) R7 M265"
	},
	"0x130A": {
	  "Graphics card": "AMD Radeon(TM) R6 Graphics"
	},
	"0x6907": {
	  "Graphics card": "AMD Radeon(TM) R5 M315"
	},
	"0x6901": {
	  "Graphics card": "AMD Radeon(TM) R5 M255"
	},
	"0x665D": {
	  "Graphics card": "AMD Radeon R7 200 Series"
	},
	"0x130D": {
	  "Graphics card": "AMD Radeon R6 200 Series"
	},
	"0x9874": {
	  "Graphics card": "AMD Radeon R6 Series"
	},
	"0x666F": {
	  "Graphics card": "AMD Radeon R5 M230"
	},
	"0x6665": {
	  "Graphics card": "AMD Radeon R5 M230"
	},
	"0x1318": {
	  "Graphics card": "AMD Radeon R5"
	},
	"0x1316": {
	  "Graphics card": "AMD Radeon R5"
	},
	"0x1315": {
	  "Graphics card": "AMD Radeon R5"
	},
	"0x130E": {
	  "Graphics card": "AMD Radeon R5"
	},
	"0x6664": {
	  "Graphics card": "AMD Radeon R5 M200 Series"
	},
	"0x6811": {
	  "Graphics card": "AMD Radeon R9 200 Series"
	},
	"0x130B": {
	  "Graphics card": "AMD Radeon R4 Graphics"
	},
	"0x9851": {
	  "Graphics card": "AMD Radeon R4 Graphics"
	},
	"0x98E4": {
	  "Graphics card": "AMD Radeon R4 Graphics"
	},
	"0x9850": {
	  "Graphics card": "AMD Radeon R3 Graphics"
	},
	"0x9854": {
	  "Graphics card": "AMD Radeon R3 Graphics"
	},
	"0x9852": {
	  "Graphics card": "AMD Radeon R2 Graphics"
	},
	"0x9853": {
	  "Graphics card": "AMD Radeon R2 Graphics"
	},
	"0x9856": {
	  "Graphics card": "AMD Radeon R2E Graphics"
	},
	"0x6649": {
	  "Graphics card": "AMD Radeon HD 7970"
	},
	"0x6650": {
	  "Graphics card": "AMD Radeon HD 7970"
	},
	"0x6651": {
	  "Graphics card": "AMD Radeon HD 7970"
	},
	"0x6798": {
	  "Graphics card": "AMD Radeon HD 7900 Series"
	},
	"0x6799": {
	  "Graphics card": "AMD Radeon HD 7900 Series"
	},
	"0x679A": {
	  "Graphics card": "AMD Radeon HD 7900 Series"
	},
	"0x679B": {
	  "Graphics card": "AMD Radeon HD 7900 Series"
	},
	"0x6790": {
	  "Graphics card": "7900 MOD - AMD Radeon HD 7900 GHz Series"
	},
	"0x6800": {
	  "Graphics card": "AMD Radeon HD 7970M"
	},
	"0x6818": {
	  "Graphics card": "AMD Radeon HD 7800 Series"
	},
	"0x6819": {
	  "Graphics card": "AMD Radeon HD 7800 Series"
	},
	"0x679E": {
	  "Graphics card": "AMD Radeon HD 7800 Series"
	},
	"0x6825": {
	  "Graphics card": "AMD Radeon HD 7800M Series"
	},
	"0x6827": {
	  "Graphics card": "AMD Radeon HD 7800M Series"
	},
	"0x6837": {
	  "Graphics card": "AMD Radeon HD7700 Series"
	},
	"0x682F": {
	  "Graphics card": "AMD Radeon HD 7700 Series"
	},
	"0x683D": {
	  "Graphics card": "AMD Radeon HD 7700 Series"
	},
	"0x683F": {
	  "Graphics card": "AMD Radeon HD 7700 Series"
	},
	"0x682D": {
	  "Graphics card": "AMD Radeon HD 7700M Series"
	},
	"0x6831": {
	  "Graphics card": "AMD Radeon HD 7700M Series"
	},
	"0x9903": {
	  "Graphics card": "AMD Radeon HD 7640G"
	},
	"0x9913": {
	  "Graphics card": "AMD Radeon HD 7640G"
	},
	"0x9901": {
	  "Graphics card": "AMD Radeon HD 7660D"
	},
	"0x9900": {
	  "Graphics card": "AMD Radeon HD 7660G"
	},
	"0x9910": {
	  "Graphics card": "AMD Radeon HD 7660G"
	},
	"0x9907": {
	  "Graphics card": "AMD Radeon HD 7620G"
	},
	"0x9917": {
	  "Graphics card": "AMD Radeon HD 7620G"
	},
	"0x9918": {
	  "Graphics card": "AMD Radeon HD 7600G"
	},
	"0x6840": {
	  "Graphics card": "AMD Radeon HD 7600 Series"
	},
	"0x6841": {
	  "Graphics card": "AMD Radeon HD 7600 Series"
	},
	"0x6843": {
	  "Graphics card": "AMD Radeon HD 7600 Series"
	},
	"0x675B": {
	  "Graphics card": "AMD Radeon HD 7600 Series"
	},
	"0x9908": {
	  "Graphics card": "AMD Radeon HD 7600G"
	},
	"0x6751": {
	  "Graphics card": "AMD Radeon HD 7600A Series"
	},
	"0x6742": {
	  "Graphics card": "AMD Radeon HD 7500/7600 Series"
	},
	"0x9990": {
	  "Graphics card": "AMD Radeon HD 7520G"
	},
	"0x9991": {
	  "Graphics card": "AMD Radeon HD 7540D"
	},
	"0x9904": {
	  "Graphics card": "AMD Radeon HD 7560D"
	},
	"0x99A0": {
	  "Graphics card": "AMD Radeon HD 7520G"
	},
	"0x9919": {
	  "Graphics card": "AMD Radeon HD 7500G"
	},
	"0x990A": {
	  "Graphics card": "AMD Radeon HD 7500G"
	},
	"0x6850": {
	  "Graphics card": "AMD Radeon HD 7500 Series"
	},
	"0x675D": {
	  "Graphics card": "AMD Radeon HD 7500 Series"
	},
	"0x6858": {
	  "Graphics card": "AMD Radeon HD 7500 Series"
	},
	"0x9993": {
	  "Graphics card": "AMD Radeon HD 7480D"
	},
	"0x99A2": {
	  "Graphics card": "AMD Radeon HD 7420G"
	},
	"0x9992": {
	  "Graphics card": "AMD Radeon HD 7420G"
	},
	"0x9994": {
	  "Graphics card": "AMD Radeon HD 7400G"
	},
	"0x6859": {
	  "Graphics card": "AMD Radeon HD 7400 Series"
	},
	"0x6849": {
	  "Graphics card": "AMD Radeon HD 7400 Series"
	},
	"0x6772": {
	  "Graphics card": "AMD Radeon HD 7400 Series"
	},
	"0x677B": {
	  "Graphics card": "AMD Radeon HD 7400 Series"
	},
	"0x99A4": {
	  "Graphics card": "AMD Radeon HD 7400G"
	},
	"0x68FA": {
	  "Graphics card": "AMD Radeon HD 7350"
	},
	"0x9808": {
	  "Graphics card": "AMD Radeon HD 7340 Graphics"
	},
	"0x9809": {
	  "Graphics card": "AMD Radeon HD 7310 Graphics"
	},
	"0x980A": {
	  "Graphics card": "AMD Radeon HD 7290 Graphics"
	},
	"0x6778": {
	  "Graphics card": "AMD Radeon HD 7000 Series"
	},
	"0x6842": {
	  "Graphics card": "AMD Radeon HD 7000M Series"
	},
	"0x671F": {
	  "Graphics card": "AMD Radeon HD 6900 Series"
	},
	"0x6720": {
	  "Graphics card": "AMD Radeon HD 6900M Series"
	},
	"0x6718": {
	  "Graphics card": "AMD Radeon HD 6900 Series"
	},
	"0x6719": {
	  "Graphics card": "AMD Radeon HD 6900 Series"
	},
	"0x671C": {
	  "Graphics card": "ATI Radeon Graphics Processor"
	},
	"0x671D": {
	  "Graphics card": "ATI Radeon Graphics Processor"
	},
	"0x689B": {
	  "Graphics card": "AMD Radeon HD 6800 Series"
	},
	"0x68A8": {
	  "Graphics card": "AMD Radeon HD 6800M Series"
	},
	"0x6738": {
	  "Graphics card": "AMD Radeon HD 6800 Series"
	},
	"0x6739": {
	  "Graphics card": "AMD Radeon HD 6800 Series"
	},
	"0x68BA": {
	  "Graphics card": "AMD Radeon HD 6700 Series"
	},
	"0x673E": {
	  "Graphics card": "AMD Radeon HD 6700 Series"
	},
	"0x68BF": {
	  "Graphics card": "AMD Radeon HD 6700 Series"
	},
	"0x6740": {
	  "Graphics card": "AMD Radeon HD 6700M Series"
	},
	"0x6743": {
	  "Graphics card": "AMD Radeon E6760"
	},
	"0x6741": {
	  "Graphics card": "AMD Radeon 6600M and 6700M Series"
	},
	"0x6763": {
	  "Graphics card": "AMD Radeon E6460"
	},
	"0x9641": {
	  "Graphics card": "AMD Radeon HD 6620G"
	},
	"0x68C0": {
	  "Graphics card": "AMD Radeon HD 6570M/5700 Series"
	},
	"0x964A": {
	  "Graphics card": "AMD Radeon HD 6530D"
	},
	"0x9640": {
	  "Graphics card": "AMD Radeon HD 6550D"
	},
	"0x9647": {
	  "Graphics card": "AMD Radeon HD 6520G"
	},
	"0x6779": {
	  "Graphics card": "AMD Radeon HD 6450"
	},
	"0x9649": {
	  "Graphics card": "AMD Radeon(TM) HD 6480G"
	},
	"0x9648": {
	  "Graphics card": "AMD Radeon HD 6480G"
	},
	"0x6761": {
	  "Graphics card": "AMD Radeon HD 6430M"
	},
	"0x9644": {
	  "Graphics card": "AMD Radeon HD 6410D"
	},
	"0x9645": {
	  "Graphics card": "AMD Radeon HD 6410D"
	},
	"0x6760": {
	  "Graphics card": "AMD Radeon HD 6400M Series"
	},
	"0x9642": {
	  "Graphics card": "AMD Radeon HD 6370D"
	},
	"0x9643": {
	  "Graphics card": "AMD Radeon HD 6380G"
	},
	"0x9802": {
	  "Graphics card": "AMD Radeon HD 6310 Graphics"
	},
	"0x9806": {
	  "Graphics card": "AMD Radeon HD 6320 Graphics"
	},
	"0x9803": {
	  "Graphics card": "AMD Radeon HD 6250 Graphics"
	},
	"0x9804": {
	  "Graphics card": "AMD Radeon HD 6250 Graphics"
	},
	"0x9805": {
	  "Graphics card": "AMD Radeon HD 6250 Graphics"
	},
	"0x9807": {
	  "Graphics card": "AMD Radeon HD 6290 Graphics"
	},
	"0x68E4": {
	  "Graphics card": "AMD Radeon HD 6300M Series"
	},
	"0x68E5": {
	  "Graphics card": "AMD Radeon HD 6300M Series"
	},
	"0x6758": {
	  "Graphics card": "AMD Radeon HD 6600 series"
	},
	"0x6759": {
	  "Graphics card": "AMD Radeon HD 6500"
	},
	"0x6721": {
	  "Graphics card": "Mobility Radeon HD 6000 series"
	},
	"0x6724": {
	  "Graphics card": "Mobility Radeon HD 6000 series"
	},
	"0x6725": {
	  "Graphics card": "Mobility Radeon HD 6000 series"
	},
	"0x6744": {
	  "Graphics card": "ATI Mobility Radeon HD 6000 series"
	},
	"0x6764": {
	  "Graphics card": "Mobility Radeon HD 6000 series"
	},
	"0x6765": {
	  "Graphics card": "Mobility Radeon HD 6000 series"
	},
	"0x6770": {
	  "Graphics card": "ATI Radeon 5xxx series"
	},
	"0x6750": {
	  "Graphics card": "ATI Radeon 5xxx series"
	},
	"0x689C": {
	  "Graphics card": "Radeon HD 5900 Series"
	},
	"0x689D": {
	  "Graphics card": "Radeon HD 5900 Series"
	},
	"0x6898": {
	  "Graphics card": "Radeon HD 5800 Series"
	},
	"0x6899": {
	  "Graphics card": "Radeon HD 5800 Series"
	},
	"0x689E": {
	  "Graphics card": "Radeon HD 5800 Series"
	},
	"0x68C7": {
	  "Graphics card": "ATI Mobility Radeon HD 5570"
	},
	"0x68A0": {
	  "Graphics card": "ATI Mobility Radeon HD 5800 Series"
	},
	"0x68A1": {
	  "Graphics card": "ATI Mobility Radeon HD 5800 Series"
	},
	"0x68B0": {
	  "Graphics card": "ATI Mobility Radeon HD 5800 Series"
	},
	"0x68A9": {
	  "Graphics card": "ATI FirePro V5800 (FireGL) Graphics Adapter"
	},
	"0x68BE": {
	  "Graphics card": "Radeon HD 5700 Series"
	},
	"0x68B8": {
	  "Graphics card": "Radeon HD 5700 Series"
	},
	"0x68D8": {
	  "Graphics card": "ATI Radeon HD 5670"
	},
	"0x68B9": {
	  "Graphics card": "Radeon HD 5600 Series"
	},
	"0x68DA": {
	  "Graphics card": "Radeon HD 5500 Series"
	},
	"0x675F": {
	  "Graphics card": "AMD Radeon HD 5500 Series"
	},
	"0x68D9": {
	  "Graphics card": "ATI Radeon HD 5570"
	},
	"0x68F9": {
	  "Graphics card": "Radeon HD 5400 Series"
	},
	"0x68C1": {
	  "Graphics card": "ATI Mobility Radeon HD 5000 Series"
	},
	"0x68E0": {
	  "Graphics card": "ATI Mobility Radeon HD 5000 Series"
	},
	"0x68E1": {
	  "Graphics card": "ATI Mobility Radeon HD 5000 Series"
	},
	"0x9555": {
	  "Graphics card": "ATI Mobility Radeon HD 5450"
	},
	"0x68C8": {
	  "Graphics card": "ATI FirePro V4800 (FireGL) Graphics Adapter"
	},
	"0x68C9": {
	  "Graphics card": "ATI FirePro 3800 (FireGL) Graphics Adapter"
	},
	"0x688C": {
	  "Graphics card": "AMD FireStream 9370"
	},
	"0x688D": {
	  "Graphics card": "AMD FireStream 9350"
	},
	"0x6768": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6889": {
	  "Graphics card": "ATI FirePro V7800 (FireGL) Graphics Adapter"
	},
	"0x6888": {
	  "Graphics card": "ATI FirePro V8800 (FireGL) Graphics Adapter"
	},
	"0x688A": {
	  "Graphics card": "ATI FirePro V9800 (FireGL) Graphics Adapter"
	},
	"0x6700": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6701": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6702": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6703": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6704": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6705": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6706": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6707": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6708": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6709": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6728": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6729": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6749": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x674A": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6780": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6784": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6788": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x678A": {
	  "Graphics card": "ATI FirePro V (FireGL V) Graphics Adapter"
	},
	"0x6808": {
	  "Graphics card": "ATI FirePro V(FireGL V) Graphics Adapter"
	},
	"0x6809": {
	  "Graphics card": "ATI FirePro V(FireGL V) Graphics Adapter"
	},
	"0x6828": {
	  "Graphics card": "ATI FirePro V(FireGL V) Graphics Adapter"
	},
	"0x684C": {
	  "Graphics card": "ATI FirePro V(FireGL V) Graphics Adapter"
	},
	"0x9905": {
	  "Graphics card": "ATI FirePro A300 Series(FireGL V) Graphics Adapter"
	},
	"0x9906": {
	  "Graphics card": "AMD FirePro A300 Series (FireGL V) Graphics Adapter"
	},
	"0x6640": {
	  "Graphics card": "AMD FirePro M6100 FireGL V"
	},
	"0x9444": {
	  "Graphics card": "ATI FirePro V8750 (FireGL)"
	},
	"0x9456": {
	  "Graphics card": "ATI FirePro V8700 (FireGL)"
	},
	"0x949C": {
	  "Graphics card": "ATI FirePro V7750 (FireGL)"
	},
	"0x949E": {
	  "Graphics card": "ATI FirePro V5700 (FireGL)"
	},
	"0x949F": {
	  "Graphics card": "ATI FirePro V3750 (FireGL)"
	},
	"0x94A3": {
	  "Graphics card": "ATI FirePro M7740"
	},
	"0x9440": {
	  "Graphics card": "Radeon HD 4870"
	},
	"0x9441": {
	  "Graphics card": "Radeon HD 4870 X2"
	},
	"0x9442": {
	  "Graphics card": "Radeon HD 4850"
	},
	"0x9443": {
	  "Graphics card": "Radeon HD 4850 x2"
	},
	"0x944C": {
	  "Graphics card": "Radeon HD 4830"
	},
	"0x94A0": {
	  "Graphics card": "Radeon HD 4830"
	},
	"0x944A": {
	  "Graphics card": "Radeon HD 4800 Series"
	},
	"0x9460": {
	  "Graphics card": "Radeon HD 4800 Series"
	},
	"0x9462": {
	  "Graphics card": "Radeon HD 4800 Series"
	},
	"0x94B3": {
	  "Graphics card": "Radeon HD 4770"
	},
	"0x94B5": {
	  "Graphics card": "Radeon HD 4770"
	},
	"0x944E": {
	  "Graphics card": "Radeon HD 4700 Series"
	},
	"0x94B4": {
	  "Graphics card": "Radeon HD 4700 Series"
	},
	"0x9498": {
	  "Graphics card": "Radeon HD 4600 Series"
	},
	"0x9495": {
	  "Graphics card": "Radeon HD 4600 Series"
	},
	"0x9490": {
	  "Graphics card": "Radeon HD 4600 Series"
	},
	"0x9450": {
	  "Graphics card": "Radeon HD 4550"
	},
	"0x9540": {
	  "Graphics card": "Radeon HD 4500 Series"
	},
	"0x955F": {
	  "Graphics card": "Radeon HD 4350 Series"
	},
	"0x954F": {
	  "Graphics card": "Radeon HD 4300 Series"
	},
	"0x9552": {
	  "Graphics card": "Radeon HD 4300 Series"
	},
	"0x9714": {
	  "Graphics card": "Radeon HD 4290"
	},
	"0x9715": {
	  "Graphics card": "Radeon HD 4250"
	},
	"0x9710": {
	  "Graphics card": "Radeon HD 4200"
	},
	"0x945A": {
	  "Graphics card": "ATI Mobility Radeon HD 4870"
	},
	"0x9553": {
	  "Graphics card": "ATI Mobility Radeon HD 4500/5100 Series"
	},
	"0x9488": {
	  "Graphics card": "ATI Mobility Radeon HD 4670"
	},
	"0x9480": {
	  "Graphics card": "ATI Mobility Radeon HD 4650"
	},
	"0x9491": {
	  "Graphics card": "ATI RADEON E4690"
	},
	"0x9712": {
	  "Graphics card": "Radeon HD 4250"
	},
	"0x9713": {
	  "Graphics card": "ATI Mobility Radeon 4100"
	},
	"0x950F": {
	  "Graphics card": "Radeon HD 3870 X2"
	},
	"0x9509": {
	  "Graphics card": "Radeon HD 3870 X2"
	},
	"0x9508": {
	  "Graphics card": "Radeon HD 3870"
	},
	"0x9501": {
	  "Graphics card": "Radeon HD 3870"
	},
	"0x724E": {
	  "Graphics card": "Radeon HD 3870"
	},
	"0x726E": {
	  "Graphics card": "Radeon HD 3870"
	},
	"0x9519": {
	  "Graphics card": "Radeon HD 3870"
	},
	"0x9511": {
	  "Graphics card": "Radeon HD 3870"
	},
	"0x9513": {
	  "Graphics card": "Radeon HD 3850 X2"
	},
	"0x9506": {
	  "Graphics card": "Radeon HD 3850 X2"
	},
	"0x9505": {
	  "Graphics card": "Radeon HD 3850"
	},
	"0x9500": {
	  "Graphics card": "Radeon HD 3850"
	},
	"0x9504": {
	  "Graphics card": "Radeon HD 3850"
	},
	"0x9507": {
	  "Graphics card": "Radeon HD 3850"
	},
	"0x9515": {
	  "Graphics card": "Radeon HD 3850 AGP"
	},
	"0x9590": {
	  "Graphics card": "Radeon HD 3600"
	},
	"0x9597": {
	  "Graphics card": "Radeon HD 3600"
	},
	"0x9598": {
	  "Graphics card": "Radeon HD 3600"
	},
	"0x9599": {
	  "Graphics card": "Radeon HD 3600"
	},
	"0x9591": {
	  "Graphics card": "Radeon HD 3600"
	},
	"0x9593": {
	  "Graphics card": "Radeon HD 3600"
	},
	"0x9596": {
	  "Graphics card": "Radeon HD 3600 AGP"
	},
	"0x95CF": {
	  "Graphics card": "Radeon HD 3450"
	},
	"0x95C6": {
	  "Graphics card": "Radeon HD 3450"
	},
	"0x95C9": {
	  "Graphics card": "Radeon HD 3450"
	},
	"0x95C5": {
	  "Graphics card": "Radeon HD 3400"
	},
	"0x95C4": {
	  "Graphics card": "Radeon HD 3400"
	},
	"0x95C2": {
	  "Graphics card": "Radeon HD 3400"
	},
	"0x95C7": {
	  "Graphics card": "Radeon HD 3400"
	},
	"0x95C0": {
	  "Graphics card": "Radeon HD 3400"
	},
	"0x9614": {
	  "Graphics card": "Radeon HD 3200"
	},
	"0x9610": {
	  "Graphics card": "Radeon HD 3200"
	},
	"0x9612": {
	  "Graphics card": "Radeon HD 3200"
	},
	"0x9620": {
	  "Graphics card": "ATI Radeon HD 3200 Graphics"
	},
	"0x9405": {
	  "Graphics card": "Radeon HD 2900"
	},
	"0x9404": {
	  "Graphics card": "Radeon HD 2900"
	},
	"0x9403": {
	  "Graphics card": "Radeon HD 2900"
	},
	"0x9402": {
	  "Graphics card": "Radeon HD 2900"
	},
	"0x9401": {
	  "Graphics card": "Radeon HD 2900"
	},
	"0x9400": {
	  "Graphics card": "Radeon HD 2900"
	},
	"0x958E": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x958B": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x9589": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x9588": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x9587": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x9586": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x9583": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x9580": {
	  "Graphics card": "ATI Radeon HD 2600 X2 Series"
	},
	"0x9581": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x95CC": {
	  "Graphics card": "Radeon HD 2600"
	},
	"0x94CB": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x94C9": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x94C5": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x94C4": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x94C3": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x94C1": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x94CC": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x9611": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x9613": {
	  "Graphics card": "Radeon HD 2400"
	},
	"0x94C8": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x94C7": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x718A": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x7188": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x7211": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x7210": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x958D": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x958C": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x940F": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x940B": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x940A": {
	  "Graphics card": "Radeon HD 2300"
	},
	"0x68F1": {
	  "Graphics card": "ATI Firepro 2460"
	},
	"0x68F2": {
	  "Graphics card": "AMD FirePro 2270 (ATI FireGL)"
	},
	"0x9616": {
	  "Graphics card": "AMD 760G"
	},
	"0x7248": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7249": {
	  "Graphics card": "Radeon X1900"
	},
	"0x724A": {
	  "Graphics card": "Radeon X1900"
	},
	"0x724B": {
	  "Graphics card": "Radeon X1900"
	},
	"0x724C": {
	  "Graphics card": "Radeon X1900"
	},
	"0x724D": {
	  "Graphics card": "Radeon X1900"
	},
	"0x724F": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7243": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7245": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7246": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7247": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7268": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7269": {
	  "Graphics card": "Radeon X1900"
	},
	"0x726A": {
	  "Graphics card": "Radeon X1900"
	},
	"0x726B": {
	  "Graphics card": "Radeon X1900"
	},
	"0x726C": {
	  "Graphics card": "Radeon X1900"
	},
	"0x726D": {
	  "Graphics card": "Radeon X1900"
	},
	"0x726F": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7263": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7265": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7266": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7267": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7280": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7240": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7244": {
	  "Graphics card": "Radeon X1900"
	},
	"0x72A0": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7260": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7264": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7288": {
	  "Graphics card": "Radeon X1900"
	},
	"0x72A8": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7284": {
	  "Graphics card": "Radeon X1900"
	},
	"0x7101": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7102": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7105": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7108": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7109": {
	  "Graphics card": "Radeon X1800 Series"
	},
	"0x7120": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7129": {
	  "Graphics card": "Radeon X1800"
	},
	"0x710A": {
	  "Graphics card": "Radeon X1800"
	},
	"0x710B": {
	  "Graphics card": "Radeon X1800"
	},
	"0x710C": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7100": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7125": {
	  "Graphics card": "810e (82810E DC-133 Chipset Graphics Controller)"
	},
	"0x7128": {
	  "Graphics card": "810 (82810-M DC-100 System and Graphics Controller)"
	},
	"0x712A": {
	  "Graphics card": "810 (82810-M DC-133 System and Graphics Controller)"
	},
	"0x712B": {
	  "Graphics card": "Radeon X1800"
	},
	"0x712C": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7124": {
	  "Graphics card": "Radeon X1800"
	},
	"0x710E": {
	  "Graphics card": "Radeon X1800"
	},
	"0x712E": {
	  "Graphics card": "Radeon X1800"
	},
	"0x710F": {
	  "Graphics card": "Radeon X1800"
	},
	"0x712F": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7104": {
	  "Graphics card": "Radeon X1800"
	},
	"0x7106": {
	  "Graphics card": "Radeon X1800 Mobility"
	},
	"0x7103": {
	  "Graphics card": "Radeon X1800 Mobility"
	},
	"0x71C0": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71C2": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71E0": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71E2": {
	  "Graphics card": "Radeon X1600"
	},
	"0x81EE": {
	  "Graphics card": "Radeon X1600"
	},
	"0x81C0": {
	  "Graphics card": "Radeon X1600"
	},
	"0x7140": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71CD": {
	  "Graphics card": "Radeon X1600"
	},
	"0x7181": {
	  "Graphics card": "Radeon X1600"
	},
	"0x7160": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71ED": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71A1": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71C6": {
	  "Graphics card": "Radeon X1600"
	},
	"0x7291": {
	  "Graphics card": "Radeon X1600"
	},
	"0x7293": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71C1": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71C5": {
	  "Graphics card": "Radeon X1600 Mobility"
	},
	"0x71C7": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71E6": {
	  "Graphics card": "Radeon X1600"
	},
	"0x72B1": {
	  "Graphics card": "Radeon X1600"
	},
	"0x72B3": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71E1": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71E7": {
	  "Graphics card": "Radeon X1600"
	},
	"0x719B": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71BB": {
	  "Graphics card": "Radeon X1600"
	},
	"0x71D4": {
	  "Graphics card": "Radeon X1600 Mobility"
	},
	"0x7142": {
	  "Graphics card": "Radeon X1550"
	},
	"0x7146": {
	  "Graphics card": "Radeon X1300 Series"
	},
	"0x7162": {
	  "Graphics card": "Radeon X1300 Series"
	},
	"0x7166": {
	  "Graphics card": "Radeon X1300 Series"
	},
	"0x714E": {
	  "Graphics card": "Radeon X1300"
	},
	"0x715E": {
	  "Graphics card": "Radeon X1300"
	},
	"0x714D": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71CE": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71C3": {
	  "Graphics card": "Radeon X1300"
	},
	"0x718F": {
	  "Graphics card": "Radeon X1300"
	},
	"0x716E": {
	  "Graphics card": "Radeon X1300"
	},
	"0x717E": {
	  "Graphics card": "Radeon X1300"
	},
	"0x716D": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71E3": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71AF": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7190": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7183": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7187": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71A0": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71A3": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71A7": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7147": {
	  "Graphics card": "Radeon X1300"
	},
	"0x715F": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7167": {
	  "Graphics card": "Radeon X1300"
	},
	"0x717F": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7193": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7143": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71B3": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7163": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7149": {
	  "Graphics card": "Radeon X1300"
	},
	"0x714A": {
	  "Graphics card": "Radeon X1300"
	},
	"0x714B": {
	  "Graphics card": "Radeon X1300"
	},
	"0x714C": {
	  "Graphics card": "Radeon X1300"
	},
	"0x718B": {
	  "Graphics card": "Radeon X1300"
	},
	"0x718C": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7196": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7145": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7186": {
	  "Graphics card": "Radeon X1300"
	},
	"0x718D": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71C4": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71D5": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71DE": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71D6": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7152": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7172": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7153": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7173": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71D2": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71DA": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71F2": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71FA": {
	  "Graphics card": "Radeon X1300"
	},
	"0x5E48": {
	  "Graphics card": "Radeon X1300"
	},
	"0x7180": {
	  "Graphics card": "Radeon X1300"
	},
	"0x719F": {
	  "Graphics card": "Radeon X1300"
	},
	"0x71EE": {
	  "Graphics card": "Radeon X1300"
	},
	"0x791E": {
	  "Graphics card": "Radeon X1200"
	},
	"0x791F": {
	  "Graphics card": "Radeon X1200"
	},
	"0x793F": {
	  "Graphics card": "Radeon X1200"
	},
	"0x7941": {
	  "Graphics card": "Radeon X1200"
	},
	"0x7942": {
	  "Graphics card": "Radeon X1200"
	},
	"0x5A62": {
	  "Graphics card": "Radeon X1200"
	},
	"0x5975": {
	  "Graphics card": "Radeon X1200"
	},
	"0x5A42": {
	  "Graphics card": "Radeon X1200"
	},
	"0x4B49": {
	  "Graphics card": "Radeon X850"
	},
	"0x4B4B": {
	  "Graphics card": "Radeon X850"
	},
	"0x4B4C": {
	  "Graphics card": "Radeon X850 AGP"
	},
	"0x4B69": {
	  "Graphics card": "Radeon X850"
	},
	"0x4B6B": {
	  "Graphics card": "Radeon X850"
	},
	"0x4B6C": {
	  "Graphics card": "Radeon X850"
	},
	"0x5D52": {
	  "Graphics card": "Radeon X850 (R423)"
	},
	"0x5D4D": {
	  "Graphics card": "Radeon X850 (R423) AGP"
	},
	"0x5D4F": {
	  "Graphics card": "Radeon X850 (R423)"
	},
	"0x5D6F": {
	  "Graphics card": "Radeon X850 (R423)"
	},
	"0x5D72": {
	  "Graphics card": "Radeon X850 (R423)"
	},
	"0x5D6D": {
	  "Graphics card": "Radeon X850 (R423)"
	},
	"0x4B4A": {
	  "Graphics card": "Radeon X850"
	},
	"0x4B6A": {
	  "Graphics card": "Radeon X850"
	},
	"0x554A": {
	  "Graphics card": "Radeon X800 XT (R423)"
	},
	"0x5D57": {
	  "Graphics card": "Radeon X800 XT (R423)"
	},
	"0x5548": {
	  "Graphics card": "Radeon X800 XT (R423)"
	},
	"0x5568": {
	  "Graphics card": "Radeon X800 XT (R423)"
	},
	"0x5D77": {
	  "Graphics card": "Radeon X800 XT (R423)"
	},
	"0x556A": {
	  "Graphics card": "Radeon X800 XT (R423)"
	},
	"0x4A48": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A49": {
	  "Graphics card": "Radeon X800 PRO"
	},
	"0x4A4A": {
	  "Graphics card": "Radeon X800"
	},
	"0x4A4B": {
	  "Graphics card": "Radeon X800"
	},
	"0x4A4C": {
	  "Graphics card": "Radeon X800"
	},
	"0x4A4D": {
	  "Graphics card": "Radeon X800"
	},
	"0x4A4E": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A50": {
	  "Graphics card": "Radeon X800 XT Platinum Edition"
	},
	"0x4A68": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A69": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A6A": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A6B": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A6C": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A6D": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A6E": {
	  "Graphics card": "Radeon X800 (R420)"
	},
	"0x4A70": {
	  "Graphics card": "Radeon X800 XT Platinum Edition"
	},
	"0x5549": {
	  "Graphics card": "Radeon X800 AGP"
	},
	"0x554B": {
	  "Graphics card": "Radeon X800GT"
	},
	"0x554D": {
	  "Graphics card": "Radeon X800 Series"
	},
	"0x554F": {
	  "Graphics card": "Radeon X800 Series"
	},
	"0x5569": {
	  "Graphics card": "Radeon X800 PRO"
	},
	"0x556B": {
	  "Graphics card": "Radeon X800GT"
	},
	"0x556D": {
	  "Graphics card": "Radeon X800 Series"
	},
	"0x556F": {
	  "Graphics card": "Radeon X800 Series"
	},
	"0x4A54": {
	  "Graphics card": "Radeon ALL-IN-WONDER X800 VE"
	},
	"0x4A74": {
	  "Graphics card": "Radeon ALL-IN-WONDER X800 VE"
	},
	"0x5E68": {
	  "Graphics card": "Radeon X800"
	},
	"0x5551": {
	  "Graphics card": "Radeon X800"
	},
	"0x5571": {
	  "Graphics card": "Radeon X800"
	},
	"0x5550": {
	  "Graphics card": "Radeon X800"
	},
	"0x5570": {
	  "Graphics card": "Radeon X800"
	},
	"0x5D49": {
	  "Graphics card": "Radeon X800 Mobility"
	},
	"0x5D4A": {
	  "Graphics card": "Radeon X800 Mobility"
	},
	"0x5D48": {
	  "Graphics card": "Radeon X800 Mobility"
	},
	"0x4A4F": {
	  "Graphics card": "Radeon X800"
	},
	"0x4A6F": {
	  "Graphics card": "Radeon X800"
	},
	"0x5D4E": {
	  "Graphics card": "Radeon X800"
	},
	"0x554E": {
	  "Graphics card": "Radeon X800"
	},
	"0x5D6E": {
	  "Graphics card": "Radeon X800"
	},
	"0x556E": {
	  "Graphics card": "Radeon X800"
	},
	"0x5E4B": {
	  "Graphics card": "Radeon X700"
	},
	"0x5E4C": {
	  "Graphics card": "Radeon X700"
	},
	"0x5E4D": {
	  "Graphics card": "Radeon X700"
	},
	"0x5E6B": {
	  "Graphics card": "Radeon X700"
	},
	"0x5E6C": {
	  "Graphics card": "Radeon X700"
	},
	"0x5E6D": {
	  "Graphics card": "Radeon X700"
	},
	"0x5653": {
	  "Graphics card": "Radeon X700 Mobility"
	},
	"0x5673": {
	  "Graphics card": "Radeon X700 Mobility"
	},
	"0x5E4A": {
	  "Graphics card": "Radeon X700 XT"
	},
	"0x5E6A": {
	  "Graphics card": "Radeon X700 XT"
	},
	"0x566F": {
	  "Graphics card": "Radeon X700"
	},
	"0x5652": {
	  "Graphics card": "Radeon X700 Mobility"
	},
	"0x9595": {
	  "Graphics card": "Radeon X700 Mobility"
	},
	"0x3E50": {
	  "Graphics card": "Radeon X600 (R380)"
	},
	"0x3E54": {
	  "Graphics card": "Radeon X600 (R380)"
	},
	"0x3E70": {
	  "Graphics card": "Radeon X600 (R380)"
	},
	"0x3E74": {
	  "Graphics card": "Radeon X600 (R380)"
	},
	"0x5B62": {
	  "Graphics card": "Radeon X600 Series"
	},
	"0x5B72": {
	  "Graphics card": "Radeon X600 Series"
	},
	"0x4C6E": {
	  "Graphics card": "Radeon X600"
	},
	"0x3150": {
	  "Graphics card": "Radeon X600"
	},
	"0x5462": {
	  "Graphics card": "Radeon X600"
	},
	"0x5B60": {
	  "Graphics card": "Radeon X300 (RV370)"
	},
	"0x5B64": {
	  "Graphics card": "Radeon X300 (RV370)"
	},
	"0x5B70": {
	  "Graphics card": "Radeon X300 (RV370)"
	},
	"0x5B74": {
	  "Graphics card": "Radeon X300 (RV370)"
	},
	"0x5E4F": {
	  "Graphics card": "Radeon X300"
	},
	"0x5E6F": {
	  "Graphics card": "Radeon X300"
	},
	"0x5460": {
	  "Graphics card": "Radeon X300 Mobility (M22)"
	},
	"0x5461": {
	  "Graphics card": "Radeon X300 Mobility (M22)"
	},
	"0x5B63": {
	  "Graphics card": "Radeon X300"
	},
	"0x564F": {
	  "Graphics card": "Radeon X300"
	},
	"0x5B65": {
	  "Graphics card": "Radeon X300"
	},
	"0x5657": {
	  "Graphics card": "Radeon X300"
	},
	"0x5677": {
	  "Graphics card": "Radeon X300"
	},
	"0x5B73": {
	  "Graphics card": "Radeon X300"
	},
	"0x5B75": {
	  "Graphics card": "Radeon X300"
	},
	"0x5D45": {
	  "Graphics card": "Radeon X300"
	},
	"0x3152": {
	  "Graphics card": "Radeon X300 Mobility (M24)"
	},
	"0x5464": {
	  "Graphics card": "Radeon X300 Mobility"
	},
	"0x3154": {
	  "Graphics card": "Radeon X300 Mobility"
	},
	"0x564A": {
	  "Graphics card": "Radeon X300 Mobility"
	},
	"0x564B": {
	  "Graphics card": "Radeon X300 Mobility"
	},
	"0x5854": {
	  "Graphics card": "Radeon X200"
	},
	"0x5874": {
	  "Graphics card": "Radeon X200"
	},
	"0x5954": {
	  "Graphics card": "Radeon X200"
	},
	"0x5955": {
	  "Graphics card": "Radeon X200 Mobility"
	},
	"0x5965": {
	  "Graphics card": "Radeon X200"
	},
	"0x5974": {
	  "Graphics card": "Radeon X200"
	},
	"0x5A41": {
	  "Graphics card": "Radeon X200"
	},
	"0x5A43": {
	  "Graphics card": "Radeon X200"
	},
	"0x5A61": {
	  "Graphics card": "Radeon X200"
	},
	"0x5A63": {
	  "Graphics card": "Radeon X200"
	},
	"0x4148": {
	  "Graphics card": "Radeon 9800 (R350)"
	},
	"0x4168": {
	  "Graphics card": "Radeon 9800 (R350)"
	},
	"0x4E48": {
	  "Graphics card": "Radeon 9800 Series"
	},
	"0x4E49": {
	  "Graphics card": "Radeon 9800 Series"
	},
	"0x4E68": {
	  "Graphics card": "Radeon 9800 Series"
	},
	"0x4E69": {
	  "Graphics card": "Radeon 9800 Series"
	},
	"0x4E4A": {
	  "Graphics card": "Radeon 9800 XT (R360)"
	},
	"0x4E6A": {
	  "Graphics card": "Radeon 9800 XT (R360)"
	},
	"0x4145": {
	  "Graphics card": "Radeon 9700 (R300)"
	},
	"0x4146": {
	  "Graphics card": "Radeon 9700 (R300)"
	},
	"0x4E44": {
	  "Graphics card": "Radeon 9700 PRO"
	},
	"0x4E45": {
	  "Graphics card": "Radeon 9700 (R300)"
	},
	"0x4E64": {
	  "Graphics card": "Radeon 9700 PRO (R300)"
	},
	"0x4E65": {
	  "Graphics card": "Radeon 9700 (R300)"
	},
	"0x4152": {
	  "Graphics card": "Radeon 9600 XT (RV360)"
	},
	"0x4172": {
	  "Graphics card": "Radeon 9600 XT (RV360)"
	},
	"0x4150": {
	  "Graphics card": "Radeon 9600 SE (RV350)"
	},
	"0x4151": {
	  "Graphics card": "Radeon 9600 SE (RV350)"
	},
	"0x4170": {
	  "Graphics card": "Radeon 9600 (RV350)"
	},
	"0x4171": {
	  "Graphics card": "Radeon 9600 SE (RV350)"
	},
	"0x4E46": {
	  "Graphics card": "Radeon 9600 (RV350)"
	},
	"0x4E66": {
	  "Graphics card": "Radeon 9600 (RV350)"
	},
	"0x4E51": {
	  "Graphics card": "Radeon 9600 Series"
	},
	"0x4E71": {
	  "Graphics card": "Radeon 9600 Series"
	},
	"0x4E50": {
	  "Graphics card": "Radeon 9600 Mobility"
	},
	"0x4E54": {
	  "Graphics card": "Radeon 9600 Mobility"
	},
	"0x4E52": {
	  "Graphics card": "Radeon 9600 Mobility"
	},
	"0x4155": {
	  "Graphics card": "Radeon 9600 Series"
	},
	"0x4166": {
	  "Graphics card": "Radeon 9600 TX"
	},
	"0x4E56": {
	  "Graphics card": "Radeon 9600 Mobility"
	},
	"0x4154": {
	  "Graphics card": "Radeon 9600"
	},
	"0x4174": {
	  "Graphics card": "Radeon 9600"
	},
	"0x4175": {
	  "Graphics card": "Radeon 9600 Series"
	},
	"0x95CE": {
	  "Graphics card": "Radeon 9600"
	},
	"0x3151": {
	  "Graphics card": "Radeon 9600"
	},
	"0x3171": {
	  "Graphics card": "Radeon 9600"
	},
	"0x95CD": {
	  "Graphics card": "Radeon 9600"
	},
	"0x959B": {
	  "Graphics card": "Radeon 9600"
	},
	"0x958F": {
	  "Graphics card": "Radeon 9600"
	},
	"0x4153": {
	  "Graphics card": "Radeon 9550"
	},
	"0x4173": {
	  "Graphics card": "Radeon 9550"
	},
	"0x4144": {
	  "Graphics card": "Radeon 9500 (R300)"
	},
	"0x4149": {
	  "Graphics card": "Radeon 9500 (R300)"
	},
	"0x4164": {
	  "Graphics card": "Radeon 9500 (R300)"
	},
	"0x4169": {
	  "Graphics card": "Radeon 9500 (R300)"
	},
	"0x4167": {
	  "Graphics card": "Radeon 9500"
	},
	"0x4147": {
	  "Graphics card": "Radeon 9500"
	},
	"0x4E47": {
	  "Graphics card": "Radeon 9500"
	},
	"0x4E67": {
	  "Graphics card": "Radeon 9500"
	},
	"0x4E4B": {
	  "Graphics card": "Radeon 9500"
	},
	"0x4E6B": {
	  "Graphics card": "Radeon 9500"
	},
	"0x796E": {
	  "Graphics card": "Radeon 9500"
	},
	"0x4136": {
	  "Graphics card": "Radeon IGP 320"
	},
	"0x5C41": {
	  "Graphics card": "Radeon 9250 Series"
	},
	"0x5940": {
	  "Graphics card": "Radeon 9200 (RV280)"
	},
	"0x5941": {
	  "Graphics card": "Radeon 9200 (RV280)"
	},
	"0x5960": {
	  "Graphics card": "Radeon 9200 (RV280)"
	},
	"0x5961": {
	  "Graphics card": "Radeon 9200 (RV280)"
	},
	"0x5964": {
	  "Graphics card": "Radeon 9200 (RV280)"
	},
	"0x5C43": {
	  "Graphics card": "Radeon 9200 Series"
	},
	"0x5D44": {
	  "Graphics card": "Radeon 9200 (RV280)"
	},
	"0x5C61": {
	  "Graphics card": "Mobility Radeon 9200 (M9+)"
	},
	"0x5C63": {
	  "Graphics card": "Mobility Radeon 9200 (M9+)"
	},
	"0x7835": {
	  "Graphics card": "Mobility Radeon 9200 IGP (RS350M)"
	},
	"0x414D": {
	  "Graphics card": "Radeon 9100 (R200)"
	},
	"0x514D": {
	  "Graphics card": "Radeon 9100 (R200)"
	},
	"0x516D": {
	  "Graphics card": "Radeon 9100 (R200)"
	},
	"0x7834": {
	  "Graphics card": "Radeon 9000 XT IGP (RS350)"
	},
	"0x4966": {
	  "Graphics card": "Radeon 9000 (RV250)"
	},
	"0x4967": {
	  "Graphics card": "Radeon 9000 (RV250)"
	},
	"0x496E": {
	  "Graphics card": "Radeon ALL-IN-WONDER 9000"
	},
	"0x496F": {
	  "Graphics card": "Radeon 9000 (RV250)"
	},
	"0x4C67": {
	  "Graphics card": "Radeon 9000 (RV250)"
	},
	"0x4C6F": {
	  "Graphics card": "Radeon 9000 (RV250)"
	},
	"0x4C66": {
	  "Graphics card": "Mobility Radeon 9000 (M9)"
	},
	"0x5834": {
	  "Graphics card": "Radeon 9000/9100 IGP (RS300)"
	},
	"0x5835": {
	  "Graphics card": "Mobility Radeon 9000 IGP (RS300M)"
	},
	"0x4242": {
	  "Graphics card": "Radeon 8500 (R200) (All-In-Wonder Radeon 8500DV)"
	},
	"0x5148": {
	  "Graphics card": "Radeon 8500 (R200 QH) (Radeon FireGL)"
	},
	"0x514C": {
	  "Graphics card": "Radeon 8500 (R200)"
	},
	"0x514E": {
	  "Graphics card": "Radeon 8500 (R200)"
	},
	"0x514F": {
	  "Graphics card": "Radeon 8500 (R200)"
	},
	"0x516C": {
	  "Graphics card": "Radeon R200 Ql"
	},
	"0x5157": {
	  "Graphics card": "Radeon 7500 (RV200)"
	},
	"0x4C57": {
	  "Graphics card": "Mobility Radeon 7500 (M7)"
	},
	"0x5144": {
	  "Graphics card": "Radeon / Radeon 7200 (R100)"
	},
	"0x5145": {
	  "Graphics card": "Radeon / Radeon 7200 (R100)"
	},
	"0x5146": {
	  "Graphics card": "Radeon / Radeon 7200 (R100)"
	},
	"0x5147": {
	  "Graphics card": "Radeon / Radeon 7200 (R100)"
	},
	"0x4237": {
	  "Graphics card": "Radeon 7000 IGP (RS250)"
	},
	"0x4437": {
	  "Graphics card": "Mobility Radeon 7000 IGP (RS250M)"
	},
	"0x5159": {
	  "Graphics card": "Radeon VE / Radeon 7000 (RV100 - low-cost Radeon"
	},
	"0x515A": {
	  "Graphics card": "Radeon VE / Radeon 7000 (RV100 - low-cost Radeon"
	},
	"0x4C58": {
	  "Graphics card": "Mobility Radeon (M6 - Radeon VE based)"
	},
	"0x4C59": {
	  "Graphics card": "Mobility Radeon (M6 - Radeon VE based)"
	},
	"0x4C5A": {
	  "Graphics card": "Mobility Radeon (M6 - Radeon VE based)"
	},
	"0x4137": {
	  "Graphics card": "Radeon IGP 340 (RS200)"
	},
	"0x4337": {
	  "Graphics card": "Radeon IGP 340M (RS200M)"
	},
	"0x4336": {
	  "Graphics card": "Radeon IGP 320M (U1)"
	},
	"0x4D46": {
	  "Graphics card": "Rage Mobility 128 M4 (Rage 128 Pro based)"
	},
	"0x4D4C": {
	  "Graphics card": "Rage Mobility 128 M4 (Rage 128 Pro based)"
	},
	"0x4C45": {
	  "Graphics card": "Rage Mobility 128 M3 (Rage 128 Pro based)"
	},
	"0x4C46": {
	  "Graphics card": "Rage Mobility 128 M3 (Rage 128 Pro based)"
	},
	"0x5446": {
	  "Graphics card": "Rage 128 Pro ULTRA"
	},
	"0x544C": {
	  "Graphics card": "Rage 128 Pro ULTRA"
	},
	"0x5452": {
	  "Graphics card": "Rage 128 Pro ULTRA"
	},
	"0x5453": {
	  "Graphics card": "Rage 128 Pro ULTRA"
	},
	"0x5454": {
	  "Graphics card": "Rage 128 Pro ULTRA"
	},
	"0x5455": {
	  "Graphics card": "Rage 128 Pro ULTRA"
	},
	"0x5041": {
	  "Graphics card": "Rage 128 Pro GL"
	},
	"0x5042": {
	  "Graphics card": "Rage 128 Pro GL"
	},
	"0x5043": {
	  "Graphics card": "Rage 128 Pro GL"
	},
	"0x5044": {
	  "Graphics card": "Rage 128 Pro GL"
	},
	"0x5045": {
	  "Graphics card": "Rage 128 Pro GL"
	},
	"0x5046": {
	  "Graphics card": "Rage 128 Pro GL"
	},
	"0x5047": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5048": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5049": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x504A": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x504B": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x504C": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x504D": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x504E": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x504F": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5050": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5051": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5052": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5053": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5054": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5055": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5056": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5057": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5058": {
	  "Graphics card": "Rage 128 Pro VR"
	},
	"0x5245": {
	  "Graphics card": "Rage 128 GL"
	},
	"0x5246": {
	  "Graphics card": "Rage 128 GL"
	},
	"0x5247": {
	  "Graphics card": "Rage 128 GL"
	},
	"0x534B": {
	  "Graphics card": "Rage 128 GL"
	},
	"0x534C": {
	  "Graphics card": "Rage 128 GL"
	},
	"0x534D": {
	  "Graphics card": "Rage 128 GL"
	},
	"0x524B": {
	  "Graphics card": "Rage 128 VR"
	},
	"0x524C": {
	  "Graphics card": "Rage 128 VR"
	},
	"0x5345": {
	  "Graphics card": "Rage 128 VR"
	},
	"0x5346": {
	  "Graphics card": "Rage 128 VR"
	},
	"0x5347": {
	  "Graphics card": "Rage 128 VR"
	},
	"0x4C4D": {
	  "Graphics card": "Rage Mobility M/M1/P (Rage Pro based)"
	},
	"0x4C4E": {
	  "Graphics card": "Rage Mobility M/M1/P (Rage Pro based)"
	},
	"0x4C52": {
	  "Graphics card": "Rage Mobility M/M1/P (Rage Pro based)"
	},
	"0x4C53": {
	  "Graphics card": "Rage Mobility M/M1/P (Rage Pro based)"
	},
	"0x4C54": {
	  "Graphics card": "Rage Mobility M/M1/P (Rage Pro based)"
	},
	"0x4C42": {
	  "Graphics card": "Rage LT-Pro (Rage Pro based)"
	},
	"0x4C44": {
	  "Graphics card": "Rage LT-Pro (Rage Pro based)"
	},
	"0x4C49": {
	  "Graphics card": "Rage LT-Pro (Rage Pro based)"
	},
	"0x4C50": {
	  "Graphics card": "Rage LT-Pro (Rage Pro based)"
	},
	"0x4C51": {
	  "Graphics card": "Rage LT-Pro (Rage Pro based)"
	},
	"0x4C47": {
	  "Graphics card": "Rage LT (Rage II based)"
	},
	"0x474D": {
	  "Graphics card": "Rage XL (Rage Pro based)"
	},
	"0x474F": {
	  "Graphics card": "Rage XL (Rage Pro based)"
	},
	"0x4752": {
	  "Graphics card": "Rage XL (Rage Pro based)"
	},
	"0x474C": {
	  "Graphics card": "Rage XC (Rage Pro based)"
	},
	"0x474E": {
	  "Graphics card": "Rage XC (Rage Pro based)"
	},
	"0x4753": {
	  "Graphics card": "Rage XC (Rage Pro based)"
	},
	"0x4742": {
	  "Graphics card": "Rage Pro"
	},
	"0x4744": {
	  "Graphics card": "Rage Pro"
	},
	"0x4747": {
	  "Graphics card": "Rage Pro"
	},
	"0x4749": {
	  "Graphics card": "Rage Pro"
	},
	"0x4750": {
	  "Graphics card": "Rage Pro"
	},
	"0x4751": {
	  "Graphics card": "Rage Pro"
	},
	"0x4757": {
	  "Graphics card": "Rage IIC AGP"
	},
	"0x4759": {
	  "Graphics card": "Rage IIC AGP"
	},
	"0x475A": {
	  "Graphics card": "Rage IIC AGP"
	},
	"0x4756": {
	  "Graphics card": "Rage IIC PCI"
	},
	"0x5656": {
	  "Graphics card": "Rage IIC PCI"
	},
	"0x4755": {
	  "Graphics card": "Rage II+"
	},
	"0x4754": {
	  "Graphics card": "Rage II"
	},
	"0x4354": {
	  "Graphics card": "Mach 64"
	},
	"0x4358": {
	  "Graphics card": "Mach 64"
	},
	"0x4554": {
	  "Graphics card": "Mach 64"
	},
	"0x4654": {
	  "Graphics card": "Mach 64"
	},
	"0x4758": {
	  "Graphics card": "Mach 64"
	},
	"0x5354": {
	  "Graphics card": "Mach 64"
	},
	"0x5654": {
	  "Graphics card": "Mach 64"
	},
	"0x5655": {
	  "Graphics card": "Mach 64"
	},
	"0x4158": {
	  "Graphics card": "Mach 32"
	},
	"0x1DBA": {
	  "Graphics card": "NVIDIA Quadro GV100"
	},
	"0x249C": {
	  "Graphics card": "NVIDIA  GeForce RTX 3080 Laptop GPU"
	},
	"0x24DC": {
	  "Graphics card": "NVIDIA  GeForce RTX 3080 Laptop GPU"
	},
	"0x24DD": {
	  "Graphics card": "NVIDIA GeForce RTX 3070 Laptop GPU"
	},
	"0x2484": {
	  "Graphics card": "NVIDIA GeForce RTX 3070"
	},
	"0x249D": {
	  "Graphics card": "NVIDIA GeForce RTX 3070 Laptop GPU"
	},
	"0x2486": {
	  "Graphics card": "NVIDIA GeForce RTX 3060 Ti"
	},
	"0x2503": {
	  "Graphics card": "NVIDIA GeForce RTX 3060"
	},
	"0x2504": {
	  "Graphics card": "NVIDIA GeForce RTX 3060"
	},
	"0x2520": {
	  "Graphics card": "NVIDIA GeForce RTX 3060 Laptop GPU"
	},
	"0x2560": {
	  "Graphics card": "NVIDIA GeForce RTX 3060 Laptop GPU"
	},
	"0x25A0": {
	  "Graphics card": "NVIDIA GeForce RTX 3050 Ti Laptop GPU"
	},
	"0x25A2": {
	  "Graphics card": "NVIDIA GeForce RTX 3050 Laptop GPU"
	},
	"0x25A5": {
	  "Graphics card": "NVIDIA GeForce RTX 3050 Laptop GPU"
	},
	"0x25E2": {
	  "Graphics card": "NVIDIA GeForce RTX 3050 Laptop GPU"
	},
	"0x1E30": {
	  "Graphics card": "NVIDIA Quadro RTX 6000"
	},
	"0x1E78": {
	  "Graphics card": "NVIDIA Quadro RTX 6000"
	},
	"0x1EB5": {
	  "Graphics card": "NVIDIA Quadro RTX 5000 Max-Q Design"
	},
	"0x1EB0": {
	  "Graphics card": "NVIDIA Quadro RTX 5000"
	},
	"0x1EB1": {
	  "Graphics card": "NVIDIA Quadro RTX 4000"
	},
	"0x1EB6": {
	  "Graphics card": "NVIDIA Quadro RTX 4000"
	},
	"0x1F36": {
	  "Graphics card": "NVIDIA Quadro RTX 3000"
	},
	"0x1FB9": {
	  "Graphics card": "NVIDIA Quadro T1000"
	},
	"0x1EB8": {
	  "Graphics card": "NVIDIA Grid T4"
	},
	"0x1FBB": {
	  "Graphics card": "NVIDIA Quadro T500"
	},
	"0x1B30": {
	  "Graphics card": "NVIDIA Quadro P6000"
	},
	"0x1BB5": {
	  "Graphics card": "NVIDIA Quadro P5200"
	},
	"0x1BB0": {
	  "Graphics card": "NVIDIA Quadro P5000"
	},
	"0x1BB6": {
	  "Graphics card": "NVIDIA Quadro P5000"
	},
	"0x1BB9": {
	  "Graphics card": "NVIDIA Quadro P4200"
	},
	"0x1BB1": {
	  "Graphics card": "NVIDIA Quadro P4000"
	},
	"0x1BB7": {
	  "Graphics card": "NVIDIA Quadro P4000"
	},
	"0x1BBB": {
	  "Graphics card": "NVIDIA Quadro P3200 Max-Q Design"
	},
	"0x1BB8": {
	  "Graphics card": "NVIDIA Quadro P3000"
	},
	"0x1C31": {
	  "Graphics card": "NVIDIA Quadro P2200"
	},
	"0x1CBA": {
	  "Graphics card": "NVIDIA Quadro P2000 Max-Q Design"
	},
	"0x1C30": {
	  "Graphics card": "NVIDIA Quadro P2000"
	},
	"0x1CB1": {
	  "Graphics card": "NVIDIA Quadro P1000"
	},
	"0x1CBD": {
	  "Graphics card": "NVIDIA Quadro P620"
	},
	"0x1CB6": {
	  "Graphics card": "NVIDIA Quadro P620"
	},
	"0x1CB2": {
	  "Graphics card": "NVIDIA Quadro P600"
	},
	"0x1CBC": {
	  "Graphics card": "NVIDIA Quadro P600"
	},
	"0x1D34": {
	  "Graphics card": "NVIDIA Quadro P520"
	},
	"0x1D33": {
	  "Graphics card": "NVIDIA Quadro P500"
	},
	"0x1CB3": {
	  "Graphics card": "NVIDIA Quadro P400"
	},
	"0x1C09": {
	  "Graphics card": "NVIDIA P106-090"
	},
	"0x1C07": {
	  "Graphics card": "NVIDIA P106-100"
	},
	"0x1B38": {
	  "Graphics card": "NVIDIA GRID GTX P40-6"
	},
	"0x1BB3": {
	  "Graphics card": "NVIDIA GRID P40-2Q"
	},
	"0x17F0": {
	  "Graphics card": "NVIDIA Quadro M6000"
	},
	"0x17F1": {
	  "Graphics card": "NVIDIA Quadro M6000 24GB"
	},
	"0x13F8": {
	  "Graphics card": "NVIDIA Quadro M5000M"
	},
	"0x13F0": {
	  "Graphics card": "NVIDIA Quadro M5000"
	},
	"0x13F9": {
	  "Graphics card": "NVIDIA Quadro M4000M"
	},
	"0x13F1": {
	  "Graphics card": "NVIDIA Quadro M4000"
	},
	"0x13FA": {
	  "Graphics card": "NVIDIA Quadro M3000M"
	},
	"0x1436": {
	  "Graphics card": "NVIDIA Quadro M2200"
	},
	"0x13B0": {
	  "Graphics card": "NVIDIA Quadro M2000M"
	},
	"0x1430": {
	  "Graphics card": "NVIDIA Quadro M2000"
	},
	"0x13B6": {
	  "Graphics card": "NVIDIA Quadro M1200"
	},
	"0x13B1": {
	  "Graphics card": "NVIDIA Quadro M1000M"
	},
	"0x13B4": {
	  "Graphics card": "NVIDIA Quadro M620"
	},
	"0x13B2": {
	  "Graphics card": "NVIDIA Quadro M600M"
	},
	"0137B": {
	  "Graphics card": "NVIDIA Quadro M520"
	},
	"0x103A": {
	  "Graphics card": "NVIDIA Quadro K6000"
	},
	"0x103C": {
	  "Graphics card": "NVIDIA Quadro K5200"
	},
	"0x11B8": {
	  "Graphics card": "NVIDIA Quadro K5100M"
	},
	"0x11B4": {
	  "Graphics card": "NVIDIA Quadro K4200"
	},
	"0x13B3": {
	  "Graphics card": "NVIDIA Quadro K2200M"
	},
	"0x13BA": {
	  "Graphics card": "NVIDIA Quadro K2200"
	},
	"0x0FF9": {
	  "Graphics card": "NVIDIA Quadro K2000D"
	},
	"0x13BC": {
	  "Graphics card": "NVIDIA Quadro K1200"
	},
	"0x0FFC": {
	  "Graphics card": "NVIDIA Quadro K1000M"
	},
	"0x137A": {
	  "Graphics card": "NVIDIA Quadro K620M"
	},
	"0x13BB": {
	  "Graphics card": "NVIDIA Quadro K620"
	},
	"0x12BA": {
	  "Graphics card": "NVIDIA Quadro K510M"
	},
	"0x0FF3": {
	  "Graphics card": "NVIDIA Quadro K420"
	},
	"0x1D81": {
	  "Graphics card": "NVIDIA Titan V"
	},
	"0x1E37": {
	  "Graphics card": "NVIDA Tesla T10"
	},
	"0x13F2": {
	  "Graphics card": "NVIDA Tesla M60"
	},
	"0x13BD": {
	  "Graphics card": "NVIDA Tesla M40"
	},
	"0x2204": {
	  "Graphics card": "NVIDIA GeForce RTX 3090"
	},
	"0x2206": {
	  "Graphics card": "NVIDIA GeForce RTX 3080"
	},
	"0x1E02": {
	  "Graphics card": "NVIDIA GeForce RTX Titan (Turing)"
	},
	"0x1E04": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 Ti (Turing)"
	},
	"0x1E07": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 Ti (Turing)"
	},
	"0x1E82": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 (Turing)"
	},
	"0x1E84": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 / 2080 Super (Turing)"
	},
	"0x1E81": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 Super (Turing)"
	},
	"0x1E93": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 Super Mobile (Turing)"
	},
	"0x1ED3": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 Super Mobile (Turing)"
	},
	"0x1E87": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 (Turing)"
	},
	"0x1E90": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 Mobile (Turing)"
	},
	"0x1ED0": {
	  "Graphics card": "NVIDIA GeForce RTX 2080 Mobile (Turing)"
	},
	"0x1EC2": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 Super (Turing)"
	},
	"0x1EC7": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 Super (Turing)"
	},
	"0x1E91": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 Super Mobile (Turing)"
	},
	"0x1ED1": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 Super Mobile (Turing)"
	},
	"0x1F02": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 (Turing)"
	},
	"0x1F07": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 (Turing)"
	},
	"0x1F10": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 (Turing)"
	},
	"0x1F50": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 Mobile (Turing)"
	},
	"0x1F54": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 Mobile (Turing)"
	},
	"0x1F14": {
	  "Graphics card": "NVIDIA GeForce RTX 2070 Mobile (Turing)"
	},
	"0x1F06": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 Super (Turing)"
	},
	"0x1F42": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 Super (Turing)"
	},
	"0x1F47": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 Super (Turing)"
	},
	"0x1F08": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 (Turing)"
	},
	"0x1E89": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 (Turing)"
	},
	"0x1F11": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 (Turing)"
	},
	"0x1F15": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 Mobile (Turing)"
	},
	"0x1F51": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 Mobile (Turing)"
	},
	"0x1F55": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 Mobile (Turing)"
	},
	"0x1F12": {
	  "Graphics card": "NVIDIA GeForce RTX 2060 Max-Q (Turing)"
	},
	"0x2191": {
	  "Graphics card": "NVIDIA GeForce GTX 1660 Ti (Turing)"
	},
	"0x2182": {
	  "Graphics card": "NVIDIA GeForce GTX 1660 Ti (Turing)"
	},
	"0x21D1": {
	  "Graphics card": "NVIDIA GeForce GTX 1660 Ti Mobile (Turing)"
	},
	"0x2184": {
	  "Graphics card": "NVIDIA GeForce GTX 1660 (Turing)"
	},
	"0x21C4": {
	  "Graphics card": "NVIDIA GeForce GTX 1660 Super (Turing)"
	},
	"0x1F09": {
	  "Graphics card": "NVIDIA GeForce GTX 1660 Super (Turing)"
	},
	"0x1F82": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 (Turing)"
	},
	"0x2187": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 Super (Turing)"
	},
	"0x1F0A": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 (Turing)"
	},
	"0x2188": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 (Turing)"
	},
	"0x1F9D": {
	  "Graphics card": "NVIDIA GeForce GTX 1650"
	},
	"0x1F91": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 (Turing)"
	},
	"0x1F99": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 (Turing)"
	},
	"0x1F95": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 Ti Mobile (Turing)"
	},
	"0x2192": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 Ti Mobile (Turing)"
	},
	"0x1F92": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 Mobile (Turing)"
	},
	"0x1F94": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 Mobile (Turing)"
	},
	"0x1F96": {
	  "Graphics card": "NVIDIA GeForce GTX 1650 Mobile (Turing)"
	},
	"0x1B06": {
	  "Graphics card": "NVIDIA GeForce GTX 1080 Ti (Pascal)"
	},
	"0x1BA0": {
	  "Graphics card": "NVIDIA GeForce GTX 1080 Max-Q Design"
	},
	"0x1B00": {
	  "Graphics card": "NVIDIA GeForce GTX Titan X (Pascal)"
	},
	"0x1B02": {
	  "Graphics card": "NVIDIA Titan XP Collectors Edition"
	},
	"0x1B80": {
	  "Graphics card": "NVIDIA GeForce GTX 1080"
	},
	"0x1BE0": {
	  "Graphics card": "NVIDIA GeForce GTX 1080"
	},
	"0x1B82": {
	  "Graphics card": "NVIDIA GeForce GTX 1070 Ti"
	},
	"0x1B81": {
	  "Graphics card": "NVIDIA GeForce GTX 1070"
	},
	"0x1BE1": {
	  "Graphics card": "NVIDIA GeForce GTX 1070"
	},
	"0x1BA1": {
	  "Graphics card": "NVIDIA GeForce GTX 1070"
	},
	"0x1BA2": {
	  "Graphics card": "NVIDIA GeForce GTX 1070"
	},
	"0x10F0": {
	  "Graphics card": "NVIDIA GeForce GTX 1070"
	},
	"0x1C00": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1C03": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1C02": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1B84": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1C20": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1B83": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1C04": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1C06": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1C23": {
	  "Graphics card": "NVIDIA GeForce GTX 1060"
	},
	"0x1C60": {
	  "Graphics card": "NVIDIA GeForce GTX 1060 Mobile"
	},
	"0xEF21": {
	  "Graphics card": "NVIDIA GeForce GTX 1060 5GB"
	},
	"0x1C61": {
	  "Graphics card": "NVIDIA GeForce GTX 1050Ti Mobile"
	},
	"0x1CCC": {
	  "Graphics card": "NVIDIA GeForce GTX 1050Ti Mobile"
	},
	"0x1C62": {
	  "Graphics card": "NVIDIA GeForce GTX 1050 Mobile"
	},
	"0x1C92": {
	  "Graphics card": "NVIDIA GeForce GTX 1050 Mobile"
	},
	"0x1CCD": {
	  "Graphics card": "NVIDIA GeForce GTX 1050 Mobile"
	},
	"0x1C81": {
	  "Graphics card": "NVIDIA GeForce GTX 1050"
	},
	"0x1C83": {
	  "Graphics card": "NVIDIA GeForce GTX 1050"
	},
	"0x1C22": {
	  "Graphics card": "NVIDIA GeForce GTX 1050"
	},
	"0x1C21": {
	  "Graphics card": "NVIDIA GeForce GTX 1050 TI"
	},
	"0x1C82": {
	  "Graphics card": "NVIDIA GeForce GTX 1050Ti"
	},
	"0x1C8F": {
	  "Graphics card": "NVIDIA GeForce GTX 1050Ti"
	},
	"0x1C8C": {
	  "Graphics card": "NVIDIA GeForce GTX 1050Ti Mobile"
	},
	"0x1C8D": {
	  "Graphics card": "NVIDIA GeForce GTX 1050 Mobile"
	},
	"0x1C91": {
	  "Graphics card": "NVIDIA GeForce GTX 1050"
	},
	"0x1D01": {
	  "Graphics card": "NVIDIA GeForce GTX 1030"
	},
	"0x17C2": {
	  "Graphics card": "NVIDIA GeForce GTX TITAN X (Maxwell)"
	},
	"0x0FB0": {
	  "Graphics card": "NVIDIA GeForce GTX 980 TI"
	},
	"0x17C8": {
	  "Graphics card": "NVIDIA GeForce GTX 980ti"
	},
	"0x161A": {
	  "Graphics card": "NVIDIA GeForce GTX 980"
	},
	"0x13DA": {
	  "Graphics card": "NVIDIA GeForce GTX 980"
	},
	"0x13C0": {
	  "Graphics card": "NVIDIA GeForce GTX 980"
	},
	"0x13C2": {
	  "Graphics card": "NVIDIA GeForce GTX 970"
	},
	"0x1401": {
	  "Graphics card": "NVIDIA GeForce GTX 960"
	},
	"0x1406": {
	  "Graphics card": "NVIDIA GeForce GTX 960"
	},
	"0x1402": {
	  "Graphics card": "NVIDIA GeForce GTX 950"
	},
	"0x13D7": {
	  "Graphics card": "NVIDIA GeForce GTX 980M"
	},
	"0x1617": {
	  "Graphics card": "NVIDIA GeForce GTX 980M"
	},
	"0x13D8": {
	  "Graphics card": "NVIDIA GeForce GTX 970M"
	},
	"0x1618": {
	  "Graphics card": "NVIDIA GeForce GTX 970M"
	},
	"0x13D9": {
	  "Graphics card": "NVIDIA GeForce GTX 965M"
	},
	"0x1619": {
	  "Graphics card": "NVIDIA GeForce GTX 965M"
	},
	"0x1427": {
	  "Graphics card": "NVIDIA GeForce GTX 965M"
	},
	"0x1667": {
	  "Graphics card": "NVIDIA GeForce GTX 965M"
	},
	"0x139B": {
	  "Graphics card": "NVIDIA GeForce GTX 960M"
	},
	"0x139A": {
	  "Graphics card": "NVIDIA GeForce GTX 950M"
	},
	"0x1348": {
	  "Graphics card": "NVIDIA GeForce GTX 945A"
	},
	"0x1399": {
	  "Graphics card": "NVIDIA GeForce GTX 945M"
	},
	"0x1347": {
	  "Graphics card": "NVIDIA GeForce GTX 940M"
	},
	"0x139C": {
	  "Graphics card": "NVIDIA GeForce GTX 940M"
	},
	"0x134D": {
	  "Graphics card": "NVIDIA GeForce GTX 940MX"
	},
	"0x179C": {
	  "Graphics card": "NVIDIA GeForce GTX 940MX"
	},
	"0x1F9C": {
	  "Graphics card": "NVIDIA GeForce MX450"
	},
	"0x1F97": {
	  "Graphics card": "NVIDIA GeForce MX450"
	},
	"0x1F98": {
	  "Graphics card": "NVIDIA GeForce MX450"
	},
	"0x1C94": {
	  "Graphics card": "NVIDIA GeForce GTX MX350"
	},
	"0x1C96": {
	  "Graphics card": "NVIDIA GeForce GTX MX350"
	},
	"0x1D16": {
	  "Graphics card": "NVIDIA GeForce GTX MX330"
	},
	"0x1D56": {
	  "Graphics card": "NVIDIA GeForce GTX MX330"
	},
	"0x1D13": {
	  "Graphics card": "NVIDIA GeForce GTX MX250"
	},
	"0x1D52": {
	  "Graphics card": "NVIDIA GeForce GTX MX250"
	},
	"0x1D11": {
	  "Graphics card": "NVIDIA GeForce GTX MX230"
	},
	"0x1D10": {
	  "Graphics card": "NVIDIA GeForce GTX MX150"
	},
	"0x1D12": {
	  "Graphics card": "NVIDIA GeForce GTX MX150"
	},
	"0x1C90": {
	  "Graphics card": "NVIDIA GeForce GTX MX150"
	},
	"0x174E": {
	  "Graphics card": "NVIDIA GeForce GTX MX110"
	},
	"0x1349": {
	  "Graphics card": "NVIDIA GeForce GTX 930A"
	},
	"0x1346": {
	  "Graphics card": "NVIDIA GeForce GTX 930M"
	},
	"0x134E": {
	  "Graphics card": "NVIDIA GeForce GTX 930MX"
	},
	"0x1299": {
	  "Graphics card": "NVIDIA GeForce GTX 920M"
	},
	"0x134F": {
	  "Graphics card": "NVIDIA GeForce GTX 920MX"
	},
	"0x129A": {
	  "Graphics card": "NVIDIA GeForce GTX 910M"
	},
	"0x134B": {
	  "Graphics card": "NVIDIA Custom MS Surface Book"
	},
	"0x1198": {
	  "Graphics card": "NVIDIA GeForce GTX 880M"
	},
	"0x1199": {
	  "Graphics card": "NVIDIA GeForce GTX 870M"
	},
	"0x119A": {
	  "Graphics card": "NVIDIA GeForce GTX 860M"
	},
	"0x1392": {
	  "Graphics card": "NVIDIA GeForce GTX 860M"
	},
	"0x1391": {
	  "Graphics card": "NVIDIA GeForce GTX 850M"
	},
	"0x1344": {
	  "Graphics card": "NVIDIA GeForce GTX 845M"
	},
	"0x1398": {
	  "Graphics card": "NVIDIA GeForce GTX 845M"
	},
	"0x1341": {
	  "Graphics card": "NVIDIA GeForce GTX 840M"
	},
	"0x1340": {
	  "Graphics card": "NVIDIA GeForce GTX 830M"
	},
	"0x1296": {
	  "Graphics card": "NVIDIA GeForce GTX 825M"
	},
	"0x0FEE": {
	  "Graphics card": "NVIDIA GeForce GTX 810M"
	},
	"0x0FED": {
	  "Graphics card": "NVIDIA GeForce 820M"
	},
	"0x13B9": {
	  "Graphics card": "NVIDIA NVS 810"
	},
	"0x1001": {
	  "Graphics card": "GeForce GTX TITAN Z"
	},
	"0x100C": {
	  "Graphics card": "GeForce GTX TITAN Black"
	},
	"0x1005": {
	  "Graphics card": "GeForce GTX TITAN"
	},
	"0x100A": {
	  "Graphics card": "GeForce GTX 780 Ti"
	},
	"0x1004": {
	  "Graphics card": "GeForce GTX 780"
	},
	"0x1007": {
	  "Graphics card": "GeForce GTX 780"
	},
	"0x0E1A": {
	  "Graphics card": "GeForce GTX 780"
	},
	"0x1184": {
	  "Graphics card": "GeForce GTX 770"
	},
	"0x1193": {
	  "Graphics card": "GeForce GTX 760 Ti OEM"
	},
	"0x1187": {
	  "Graphics card": "GeForce GTX 760"
	},
	"0x118E": {
	  "Graphics card": "GeForce GTX 760 (192-bit)"
	},
	"0x1380": {
	  "Graphics card": "GeForce GTX 750 Ti"
	},
	"0x1381": {
	  "Graphics card": "GeForce GTX 750"
	},
	"0x1407": {
	  "Graphics card": "GeForce GT 750"
	},
	"0x1382": {
	  "Graphics card": "GeForce GT 745"
	},
	"0x0E1B": {
	  "Graphics card": "GeForce GT 740"
	},
	"0x0FC8": {
	  "Graphics card": "GeForce GT 740"
	},
	"0x11C5": {
	  "Graphics card": "GeForce GT 740"
	},
	"0x11CB": {
	  "Graphics card": "GeForce GT 740"
	},
	"0x0FC9": {
	  "Graphics card": "GeForce GT 730"
	},
	"0x0F02": {
	  "Graphics card": "GeForce GT 730"
	},
	"0x1287": {
	  "Graphics card": "GeForce GT 730"
	},
	"0x1286": {
	  "Graphics card": "GeForce GT 720"
	},
	"0x1288": {
	  "Graphics card": "GeForce GT 720"
	},
	"0x1295": {
	  "Graphics card": "GeForce GT 710A"
	},
	"0x1281": {
	  "Graphics card": "GeForce GT 710"
	},
	"0x119E": {
	  "Graphics card": "GeForce GTX 780M"
	},
	"0x119F": {
	  "Graphics card": "GeForce GTX 780M"
	},
	"0x119D": {
	  "Graphics card": "GeForce GTX 775M"
	},
	"0x11E0": {
	  "Graphics card": "GeForce GTX 770M"
	},
	"0x11E2": {
	  "Graphics card": "GeForce GTX 765M"
	},
	"0x11E1": {
	  "Graphics card": "GeForce GTX 765M"
	},
	"0x11E3": {
	  "Graphics card": "GeForce GTX 760M"
	},
	"0x0FEA": {
	  "Graphics card": "GeForce GT 755M"
	},
	"0x0FCD": {
	  "Graphics card": "GeForce GT 755M"
	},
	"0x0FE9": {
	  "Graphics card": "GeForce GT 750M"
	},
	"0x0FE4": {
	  "Graphics card": "GeForce GT 750M"
	},
	"0x0FE2": {
	  "Graphics card": "GeForce GT 745M"
	},
	"0x0FE3": {
	  "Graphics card": "GeForce GT 745A"
	},
	"0x1292": {
	  "Graphics card": "GeForce GT 740M"
	},
	"0x0FDF": {
	  "Graphics card": "GeForce GT 740M"
	},
	"0x1291": {
	  "Graphics card": "GeForce GT 735M"
	},
	"0x0FE1": {
	  "Graphics card": "GeForce GT 730M"
	},
	"0x1290": {
	  "Graphics card": "GeForce GT 730M"
	},
	"0x1293": {
	  "Graphics card": "GeForce GT 730M"
	},
	"0x1298": {
	  "Graphics card": "GeForce GT 720M"
	},
	"0x1289": {
	  "Graphics card": "GeForce GT 710"
	},
	"0x128B": {
	  "Graphics card": "GeForce GT 710"
	},
	"0x12B9": {
	  "Graphics card": "NVIDIA Quadro K610M"
	},
	"0x105B": {
	  "Graphics card": "GeForce 705M"
	},
	"0x104C": {
	  "Graphics card": "GeForce 705"
	},
	"0x0FF6": {
	  "Graphics card": "NVIDIA Quadro K1100M"
	},
	"0x1CBB": {
	  "Graphics card": "NVIDIA Quadro P1000"
	},
	"0x0FFE": {
	  "Graphics card": "NVIDIA Quadro K2000"
	},
	"0x1096": {
	  "Graphics card": "NVIDIA Tesla C2075"
	},
	"0x11B6": {
	  "Graphics card": "NVIDIA Quadro K3100M"
	},
	"0x11B7": {
	  "Graphics card": "NVIDIA Quadro K4100M"
	},
	"0x11BE": {
	  "Graphics card": "NVIDIA Quadro K3000M"
	},
	"0x11FA": {
	  "Graphics card": "NVIDIA Quadro K4000"
	},
	"0x11FC": {
	  "Graphics card": "NVIDIA Quadro K2100M"
	},
	"0x1FB8": {
	  "Graphics card": "NVIDIA Quadro T2000"
	},
	"0x1188": {
	  "Graphics card": "GeForce GTX 690"
	},
	"0x1180": {
	  "Graphics card": "GeForce GTX 680"
	},
	"0x0E0A": {
	  "Graphics card": "GeForce GTX 680"
	},
	"0x1189": {
	  "Graphics card": "GeForce GTX 670"
	},
	"0x1183": {
	  "Graphics card": "GeForce GTX 660 Ti"
	},
	"0x11C0": {
	  "Graphics card": "GeForce GTX 660"
	},
	"0x1185": {
	  "Graphics card": "GeForce GTX 660"
	},
	"0x1195": {
	  "Graphics card": "GeForce GTX 660"
	},
	"0x11C2": {
	  "Graphics card": "GeForce GTX 650 Ti BOOST"
	},
	"0x11C6": {
	  "Graphics card": "GeForce GTX 650 Ti"
	},
	"0x11C3": {
	  "Graphics card": "GeForce GTX 650 Ti"
	},
	"0x0FC6": {
	  "Graphics card": "GeForce GTX 650"
	},
	"0x11C8": {
	  "Graphics card": "GeForce GTX 650"
	},
	"0x11C4": {
	  "Graphics card": "GeForce GT 645"
	},
	"0x1207": {
	  "Graphics card": "GeForce GT 645"
	},
	"0x124B": {
	  "Graphics card": "GeForce GT 640"
	},
	"0x0FC0": {
	  "Graphics card": "GeForce GT 640"
	},
	"0x0FC1": {
	  "Graphics card": "GeForce GT 640"
	},
	"0x1282": {
	  "Graphics card": "GeForce GT 640"
	},
	"0x1280": {
	  "Graphics card": "GeForce GT 635"
	},
	"0x0FC2": {
	  "Graphics card": "GeForce GT 630"
	},
	"0x1284": {
	  "Graphics card": "GeForce GT 630"
	},
	"0x0F00": {
	  "Graphics card": "GeForce GT 630"
	},
	"0x104B": {
	  "Graphics card": "GeForce GT 625"
	},
	"0x0F01": {
	  "Graphics card": "GeForce GT 620"
	},
	"0x1049": {
	  "Graphics card": "GeForce GT 620"
	},
	"0x104A": {
	  "Graphics card": "GeForce GT 610"
	},
	"0x0F03": {
	  "Graphics card": "GeForce GT 610"
	},
	"0x11A3": {
	  "Graphics card": "GeForce GTX 680MX"
	},
	"0x11A0": {
	  "Graphics card": "GeForce GTX 680M"
	},
	"0x11A7": {
	  "Graphics card": "GeForce GTX 675MX"
	},
	"0x11A2": {
	  "Graphics card": "GeForce GTX 675MX"
	},
	"0x1212": {
	  "Graphics card": "GeForce GTX 675M"
	},
	"0x11A1": {
	  "Graphics card": "GeForce GTX 670MX"
	},
	"0x1213": {
	  "Graphics card": "GeForce GTX 670M"
	},
	"0x0FE0": {
	  "Graphics card": "GeForce GTX 660M"
	},
	"0x0FD4": {
	  "Graphics card": "GeForce GTX 660M"
	},
	"0x0FD5": {
	  "Graphics card": "GeForce GT 650M"
	},
	"0x0FD1": {
	  "Graphics card": "GeForce GT 650M"
	},
	"0x0FD9": {
	  "Graphics card": "GeForce GT 645M"
	},
	"0x0FD8": {
	  "Graphics card": "GeForce GT 640M"
	},
	"0x0FD2": {
	  "Graphics card": "GeForce GT 640M"
	},
	"0x0FD3": {
	  "Graphics card": "GeForce GT 640M LE"
	},
	"0x0DE3": {
	  "Graphics card": "GeForce GT 635M"
	},
	"0x1247": {
	  "Graphics card": "GeForce GT 635M"
	},
	"0x0DE9": {
	  "Graphics card": "GeForce GT 630M"
	},
	"0x0DE8": {
	  "Graphics card": "GeForce GT 620M"
	},
	"0x1140": {
	  "Graphics card": "GeForce GT 620M"
	},
	"0x1058": {
	  "Graphics card": "GeForce 610M"
	},
	"0x1059": {
	  "Graphics card": "GeForce 610M"
	},
	"0x105A": {
	  "Graphics card": "GeForce 610M"
	},
	"0x0DEA": {
	  "Graphics card": "GeForce 610M"
	},
	"0x1048": {
	  "Graphics card": "GeForce 605"
	},
	"0x0DF8": {
	  "Graphics card": "Quadro 600"
	},
	"0x0DFC": {
	  "Graphics card": "NVIDIA NVS 5200M"
	},
	"0x0FFB": {
	  "Graphics card": "NVIDIA Quadro K2000M"
	},
	"0x109A": {
	  "Graphics card": "NVIDIA Quadro 5010M"
	},
	"0x11BC": {
	  "Graphics card": "NVIDIA Quadro K5000M"
	},
	"0x1088": {
	  "Graphics card": "GeForce GTX 590"
	},
	"0x1080": {
	  "Graphics card": "Geforce GTX 580"
	},
	"0x1089": {
	  "Graphics card": "GeForce GTX 580"
	},
	"0x108B": {
	  "Graphics card": "GeForce GTX 580"
	},
	"0x1081": {
	  "Graphics card": "GeForce GTX 570"
	},
	"0x1086": {
	  "Graphics card": "GeForce GTX 570"
	},
	"0x1082": {
	  "Graphics card": "GeForce GTX 560 Ti"
	},
	"0x1200": {
	  "Graphics card": "GeForce GTX 560 Ti"
	},
	"0x1087": {
	  "Graphics card": "GeForce GTX 560 Ti"
	},
	"0x1208": {
	  "Graphics card": "GeForce GTX 560 SE"
	},
	"0x1084": {
	  "Graphics card": "GeForce GTX 560"
	},
	"0x1201": {
	  "Graphics card": "GeForce GTX 560"
	},
	"0x1206": {
	  "Graphics card": "GeForce GTX 555"
	},
	"0x1244": {
	  "Graphics card": "GeForce GTX 550 Ti"
	},
	"0x0004": {
	  "Graphics card": "GeForce GTX 550 Ti"
	},
	"0x1241": {
	  "Graphics card": "GeForce GT 545"
	},
	"0x1243": {
	  "Graphics card": "GeForce GT 545"
	},
	"0x0DE5": {
	  "Graphics card": "GeForce GT 530"
	},
	"0x0DE4": {
	  "Graphics card": "GeForce GT 520"
	},
	"0x1040": {
	  "Graphics card": "Geforce GT 520"
	},
	"0x1042": {
	  "Graphics card": "GeForce 510"
	},
	"0x0FFD": {
	  "Graphics card": "NVS 510"
	},
	"0x1211": {
	  "Graphics card": "GeForce GTX 580M"
	},
	"0x1210": {
	  "Graphics card": "GeForce GTX 570M"
	},
	"0x1251": {
	  "Graphics card": "GeForce GTX 560M"
	},
	"0x124D": {
	  "Graphics card": "GeForce GT 555M"
	},
	"0x1248": {
	  "Graphics card": "GeForce GT 555M"
	},
	"0x0DEB": {
	  "Graphics card": "GeForce GT 555M"
	},
	"0x0DCD": {
	  "Graphics card": "GeForce GT 555M"
	},
	"0x0DCE": {
	  "Graphics card": "GeForce GT 555M"
	},
	"0x0DF6": {
	  "Graphics card": "GeForce GT 550M"
	},
	"0x0DD6": {
	  "Graphics card": "GeForce GT 550M"
	},
	"0x1246": {
	  "Graphics card": "GeForce GT 550M"
	},
	"0x0DF4": {
	  "Graphics card": "GeForce GT 540M"
	},
	"0x0DF5": {
	  "Graphics card": "GeForce GT 525M"
	},
	"0x0DEC": {
	  "Graphics card": "GeForce GT 525M"
	},
	"0x1050": {
	  "Graphics card": "GeForce GT 520M"
	},
	"0x1051": {
	  "Graphics card": "GeForce GT 520MX"
	},
	"0x1052": {
	  "Graphics card": "GeForce GT 520M"
	},
	"0x0DF7": {
	  "Graphics card": "GeForce GT 520M"
	},
	"0x0DED": {
	  "Graphics card": "GeForce GT 520M"
	},
	"0x0A7B": {
	  "Graphics card": "NVIDIA GeForce 505"
	},
	"0x0DF9": {
	  "Graphics card": "Quadro 500M"
	},
	"0x06D8": {
	  "Graphics card": "NVIDIA Quadro 6000"
	},
	"0x06DC": {
	  "Graphics card": "NVIDIA Quadro 6000"
	},
	"0x06D9": {
	  "Graphics card": "NVIDIA Quadro 5000"
	},
	"0x06DA": {
	  "Graphics card": "NVIDIA Quadro 5000m"
	},
	"0x06DD": {
	  "Graphics card": "NVIDIA Quadro 4000"
	},
	"0x0DD8": {
	  "Graphics card": "NVIDIA Quadro 2000"
	},
	"0x0DEF": {
	  "Graphics card": "NVIDIA NVS 5400M"
	},
	"0x0DFA": {
	  "Graphics card": "NVIDIA Quadro 1000M"
	},
	"0x1056": {
	  "Graphics card": "NVIDIA NVS 4200M"
	},
	"0x1057": {
	  "Graphics card": "NVIDIA NVS 4200M"
	},
	"0x118A": {
	  "Graphics card": "NVIDIA GeForce GRID K520"
	},
	"0x11BA": {
	  "Graphics card": "NVIDIA Quadro K5000"
	},
	"0x11BD": {
	  "Graphics card": "NVIDIA Quadro K4000"
	},
	"0x06C0": {
	  "Graphics card": "GeForce GTX 480"
	},
	"0x06CD": {
	  "Graphics card": "GeForce GTX 470"
	},
	"0x06C4": {
	  "Graphics card": "NVIDIA GeForce GTX 465"
	},
	"0x0E22": {
	  "Graphics card": "GeForce GTX 460"
	},
	"0x0E23": {
	  "Graphics card": "GeForce GTX 460 SE"
	},
	"0x0E24": {
	  "Graphics card": "GeForce GTX 460"
	},
	"0x1205": {
	  "Graphics card": "GeForce GTX 460 v2"
	},
	"0x1245": {
	  "Graphics card": "GeForce GTS 450"
	},
	"0x1249": {
	  "Graphics card": "GeForce GTS 450"
	},
	"0x0DC4": {
	  "Graphics card": "GeForce GTS 450"
	},
	"0x0DC5": {
	  "Graphics card": "GeForce GTS 450"
	},
	"0x0DC6": {
	  "Graphics card": "GeForce GTS 450"
	},
	"0x0DD4": {
	  "Graphics card": "GeForce GTS 450"
	},
	"0x0DE0": {
	  "Graphics card": "GeForce GT 440"
	},
	"0x0DC0": {
	  "Graphics card": "GeForce GT 440"
	},
	"0x0DE1": {
	  "Graphics card": "GeForce GT 430"
	},
	"0x0DE2": {
	  "Graphics card": "GeForce GT 420"
	},
	"0x0A32": {
	  "Graphics card": "GeForce GT 415"
	},
	"0x06FA": {
	  "Graphics card": "NVIDIA Quadro NVS 450"
	},
	"0x06F8": {
	  "Graphics card": "NVIDIA Quadro NVS 420"
	},
	"0x0FFF": {
	  "Graphics card": "Quadro 410"
	},
	"0x10C5": {
	  "Graphics card": "GeForce 405"
	},
	"0x1054": {
	  "Graphics card": "GeForce 410M"
	},
	"0x1055": {
	  "Graphics card": "GeForce 410M"
	},
	"0x0A26": {
	  "Graphics card": "4th Gen Intel(r) Core processor graphics HD 5000 - Mobile Haswell - ULT GT3"
	},
	"0x0A27": {
	  "Graphics card": "GeForce 405"
	},
	"0x0A7A": {
	  "Graphics card": "GeForce 405"
	},
	"0x0A38": {
	  "Graphics card": "Quadro 400"
	},
	"0x0E31": {
	  "Graphics card": "GeForce GTX 485M"
	},
	"0x06CA": {
	  "Graphics card": "NVIDIA GeForce GTX 480M"
	},
	"0x0E30": {
	  "Graphics card": "GeForce GTX 470M"
	},
	"0x0DD1": {
	  "Graphics card": "GeForce GTX 460M"
	},
	"0x0DD2": {
	  "Graphics card": "GeForce GT 445M"
	},
	"0x0DD3": {
	  "Graphics card": "GeForce GT 435M"
	},
	"0x0DF2": {
	  "Graphics card": "GeForce GT 435M"
	},
	"0x0DF0": {
	  "Graphics card": "GeForce GT 425M"
	},
	"0x0DF1": {
	  "Graphics card": "GeForce GT 420M"
	},
	"0x0DF3": {
	  "Graphics card": "GeForce GT 420M"
	},
	"0x0DEE": {
	  "Graphics card": "GeForce GT 415M"
	},
	"0x0DDA": {
	  "Graphics card": "NVIDIA Quadro 2000M"
	},
	"0x0E3A": {
	  "Graphics card": "NVIDIA Quadro 3000M"
	},
	"0x0E3B": {
	  "Graphics card": "NVIDIA Quadro 4000M"
	},
	"0x0A6E": {
	  "Graphics card": "GeForce G 305M"
	},
	"0x0A70": {
	  "Graphics card": "GeForce G 310M"
	},
	"0x0A71": {
	  "Graphics card": "GeForce G 305M"
	},
	"0x0A72": {
	  "Graphics card": "GeForce G 310M"
	},
	"0x0A73": {
	  "Graphics card": "GeForce G 305M"
	},
	"0x0A35": {
	  "Graphics card": "GeForce GT 325M"
	},
	"0x0A67": {
	  "Graphics card": "GeForce G 315"
	},
	"0x0A22": {
	  "Graphics card": "GeForce G 315"
	},
	"0x0A63": {
	  "Graphics card": "GeForce G 310"
	},
	"0x0A66": {
	  "Graphics card": "GeForce G 310"
	},
	"0x0A75": {
	  "Graphics card": "GeForce G 310M"
	},
	"0x0CA0": {
	  "Graphics card": "GeForce GT 330"
	},
	"0x0CA2": {
	  "Graphics card": "GeForce GT 320"
	},
	"0x0CA4": {
	  "Graphics card": "GeForce GT 340"
	},
	"0x0CA7": {
	  "Graphics card": "GeForce GT 330"
	},
	"0x0410": {
	  "Graphics card": "GeForce GT 330"
	},
	"0x0CAF": {
	  "Graphics card": "GeForce GT 335M"
	},
	"0x0CB0": {
	  "Graphics card": "GeForce GTS 350M"
	},
	"0x0CB1": {
	  "Graphics card": "GeForce GTS 360M"
	},
	"0x0A21": {
	  "Graphics card": "GeForce GT 330M"
	},
	"0x0A29": {
	  "Graphics card": "GeForce GT 330M"
	},
	"0x0A2B": {
	  "Graphics card": "GeForce GT 330M"
	},
	"0x08A0": {
	  "Graphics card": "GeForce GT 320M"
	},
	"0x08A2": {
	  "Graphics card": "GeForce GT 320M"
	},
	"0x08A3": {
	  "Graphics card": "GeForce GT 320M"
	},
	"0x08A4": {
	  "Graphics card": "GeForce GT 320M"
	},
	"0x0A2D": {
	  "Graphics card": "GeForce GT 320M"
	},
	"0x0A2C": {
	  "Graphics card": "NVIDIA NVS 5100M"
	},
	"0x0A3C": {
	  "Graphics card": "NVIDIA Quadro FX 880M"
	},
	"0x065C": {
	  "Graphics card": "NVIDIA Quadro FX 770M"
	},
	"0x0A7C": {
	  "Graphics card": "NVIDIA Quadro FX 380M"
	},
	"0x0CBC": {
	  "Graphics card": "NVIDIA Quadro FX 1800M"
	},
	"0x0FFA": {
	  "Graphics card": "NVIDIA Quadro K600"
	},
	"0x05E0": {
	  "Graphics card": "GeForce GTX 295"
	},
	"0x05E1": {
	  "Graphics card": "GeForce GTX 280"
	},
	"0x05E2": {
	  "Graphics card": "GeForce GTX 260"
	},
	"0x05E3": {
	  "Graphics card": "GeForce GTX 285"
	},
	"0x05E6": {
	  "Graphics card": "GeForce GTX 275"
	},
	"0x05EA": {
	  "Graphics card": "GeForce GTX 260"
	},
	"0x05EB": {
	  "Graphics card": "GeForce GTX 295"
	},
	"0x0603": {
	  "Graphics card": "GeForce GT 230"
	},
	"0x0621": {
	  "Graphics card": "GeForce GT 230"
	},
	"0x0607": {
	  "Graphics card": "GeForce GT 240"
	},
	"0x060A": {
	  "Graphics card": "GeForce GTX 280M"
	},
	"0x060F": {
	  "Graphics card": "GeForce GTX 285M"
	},
	"0x0415": {
	  "Graphics card": "GeForce GTS 250"
	},
	"0x0615": {
	  "Graphics card": "GeForce GTS 250"
	},
	"0x0618": {
	  "Graphics card": "GeForce GTX 260M"
	},
	"0x0654": {
	  "Graphics card": "GeForce GT 220M"
	},
	"0x0A20": {
	  "Graphics card": "GeForce GT 220"
	},
	"0x0CA5": {
	  "Graphics card": "GeForce GT 220"
	},
	"0x0CAC": {
	  "Graphics card": "GeForce GT 220"
	},
	"0x0A30": {
	  "Graphics card": "NVIDIA GT216"
	},
	"0x0A23": {
	  "Graphics card": "GeForce 210"
	},
	"0x0A28": {
	  "Graphics card": "GeForce GT 230M"
	},
	"0x0A2A": {
	  "Graphics card": "GeForce GT 230M"
	},
	"0x0A34": {
	  "Graphics card": "GeForce GT 240M"
	},
	"0x0A60": {
	  "Graphics card": "GeForce G210"
	},
	"0x0A62": {
	  "Graphics card": "GeForce 205"
	},
	"0x0A65": {
	  "Graphics card": "GeForce 210"
	},
	"0x065F": {
	  "Graphics card": "NVIDIA GeForce G210"
	},
	"0x0A74": {
	  "Graphics card": "GeForce G210M"
	},
	"0x0CA3": {
	  "Graphics card": "GeForce GT 240"
	},
	"0x0CA8": {
	  "Graphics card": "GeForce GTS 260M"
	},
	"0x0CA9": {
	  "Graphics card": "GeForce GTS 250M"
	},
	"0x174D": {
	  "Graphics card": "GeForce MX130"
	},
	"0x05F2": {
	  "Graphics card": "NVIDIA GT200"
	},
	"0x05F9": {
	  "Graphics card": "NVIDIA Quadro CX"
	},
	"0x05FD": {
	  "Graphics card": "NVIDIA Quadro FX 5800"
	},
	"0x05FE": {
	  "Graphics card": "NVIDIA Quadro FX 4800"
	},
	"0x05FF": {
	  "Graphics card": "NVIDIA Quadro FX 3800"
	},
	"0x0638": {
	  "Graphics card": "NVIDIA Quadro FX 1800"
	},
	"0x06D1": {
	  "Graphics card": "NVIDIA Tesla C2070"
	},
	"0x0A6A": {
	  "Graphics card": "NVIDIA NVS 2100M"
	},
	"0x0A6C": {
	  "Graphics card": "NVIDIA NVS 3100M"
	},
	"0x107C": {
	  "Graphics card": "NVIDIA NVS 315"
	},
	"0x107D": {
	  "Graphics card": "NVIDIA NVS 310"
	},
	"0x0626": {
	  "Graphics card": "GeForce GT 130"
	},
	"0x0627": {
	  "Graphics card": "GeForce GT 140"
	},
	"0x0631": {
	  "Graphics card": "GeForce GTS 160M"
	},
	"0x0632": {
	  "Graphics card": "GeForce GTS 150M"
	},
	"0x0646": {
	  "Graphics card": "GeForce GT 120"
	},
	"0x0655": {
	  "Graphics card": "GeForce GT 120"
	},
	"0x0651": {
	  "Graphics card": "GeForce G 110M"
	},
	"0x0652": {
	  "Graphics card": "GeForce GT 130M"
	},
	"0x0653": {
	  "Graphics card": "GeForce GT 120M"
	},
	"0x06E6": {
	  "Graphics card": "GeForce G100"
	},
	"0x06EC": {
	  "Graphics card": "GeForce G 105M"
	},
	"0x06EF": {
	  "Graphics card": "GeForce G 103M"
	},
	"0x06F1": {
	  "Graphics card": "GeForce G105M"
	},
	"0x0872": {
	  "Graphics card": "GeForce G102M"
	},
	"0x0873": {
	  "Graphics card": "GeForce G102M"
	},
	"0x0A68": {
	  "Graphics card": "GeForce G105M"
	},
	"0x0A69": {
	  "Graphics card": "GeForce G105M"
	},
	"0x01DA": {
	  "Graphics card": "NVIDIA Quadro NVS 110M"
	},
	"0x0601": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x71CF": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x0296": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x0396": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x0414": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x064E": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x0624": {
	  "Graphics card": "NVIDIA GeForce 9800 GT"
	},
	"0x0604": {
	  "Graphics card": "GeForce 9800 GX2"
	},
	"0x0605": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x0097": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x0608": {
	  "Graphics card": "GeForce 9800M GTX"
	},
	"0x060B": {
	  "Graphics card": "GeForce 9800M GT"
	},
	"0x062F": {
	  "Graphics card": "GeForce 9800 S"
	},
	"0x0610": {
	  "Graphics card": "GeForce 9600 GSO"
	},
	"0x0612": {
	  "Graphics card": "GeForce 9800 GTX"
	},
	"0x0613": {
	  "Graphics card": "GeForce 9800 GTX+"
	},
	"0x0614": {
	  "Graphics card": "GeForce 9800 GT"
	},
	"0x0617": {
	  "Graphics card": "GeForce 9800M GTX"
	},
	"0x0622": {
	  "Graphics card": "GeForce 9600 GT"
	},
	"0x0647": {
	  "Graphics card": "GeForce 9600M GT"
	},
	"0x0623": {
	  "Graphics card": "GeForce 9600 GS"
	},
	"0x0625": {
	  "Graphics card": "GeForce 9600 GSO 512"
	},
	"0x0628": {
	  "Graphics card": "GeForce 9800M GTS"
	},
	"0x062A": {
	  "Graphics card": "GeForce 9700M GTS"
	},
	"0x062B": {
	  "Graphics card": "GeForce 9800M GS"
	},
	"0x062C": {
	  "Graphics card": "GeForce 9800M GTS"
	},
	"0x062D": {
	  "Graphics card": "GeForce 9600 GT"
	},
	"0x062E": {
	  "Graphics card": "GeForce 9600 GT"
	},
	"0x06EE": {
	  "Graphics card": "GeForce 9600 GSO"
	},
	"0x0635": {
	  "Graphics card": "GeForce 9600 GSO"
	},
	"0x0637": {
	  "Graphics card": "GeForce 9600 GT"
	},
	"0x039F": {
	  "Graphics card": "GeForce 9600 GT"
	},
	"0x00CF": {
	  "Graphics card": "GeForce 9600 GT"
	},
	"0x0640": {
	  "Graphics card": "GeForce 9500 GT"
	},
	"0x0A6B": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x5B61": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x5B66": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x0641": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x0643": {
	  "Graphics card": "GeForce 9500 GT"
	},
	"0x0644": {
	  "Graphics card": "GeForce 9500 GS"
	},
	"0x0645": {
	  "Graphics card": "GeForce 9500 GS"
	},
	"0x0648": {
	  "Graphics card": "GeForce 9600M GS"
	},
	"0x0649": {
	  "Graphics card": "GeForce 9600M GT"
	},
	"0x064A": {
	  "Graphics card": "GeForce 9700M GT"
	},
	"0x064B": {
	  "Graphics card": "GeForce 9500M G"
	},
	"0x064C": {
	  "Graphics card": "GeForce 9650M GT"
	},
	"0x0656": {
	  "Graphics card": "GeForce 9650 S"
	},
	"0x065B": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x06E0": {
	  "Graphics card": "GeForce 9300 GE"
	},
	"0x06E1": {
	  "Graphics card": "GeForce 9300 GS"
	},
	"0x10C0": {
	  "Graphics card": "GeForce 9300 GS"
	},
	"0x06E5": {
	  "Graphics card": "GeForce 9300M GS"
	},
	"0x06E7": {
	  "Graphics card": "GeForce 9300 SE"
	},
	"0x06E8": {
	  "Graphics card": "GeForce 9200M GS"
	},
	"0x06E9": {
	  "Graphics card": "GeForce 9300M GS"
	},
	"0x0860": {
	  "Graphics card": "GeForce 9300"
	},
	"0x0862": {
	  "Graphics card": "GeForce 9400M G"
	},
	"0x0864": {
	  "Graphics card": "GeForce 9300"
	},
	"0x0865": {
	  "Graphics card": "GeForce 9300"
	},
	"0x0866": {
	  "Graphics card": "GeForce 9400M G"
	},
	"0x0867": {
	  "Graphics card": "GeForce 9400"
	},
	"0x016F": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x01D5": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x042C": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x3E52": {
	  "Graphics card": "GeForce 9400 GT"
	},
	"0x086A": {
	  "Graphics card": "GeForce 9400"
	},
	"0x0869": {
	  "Graphics card": "GeForce 9400"
	},
	"0x086C": {
	  "Graphics card": "GeForce 9300"
	},
	"0x086D": {
	  "Graphics card": "GeForce 9200"
	},
	"0x0844": {
	  "Graphics card": "GeForce 9100M G"
	},
	"0x0847": {
	  "Graphics card": "GeForce 9100"
	},
	"0x086E": {
	  "Graphics card": "GeForce 9100M G"
	},
	"0x086F": {
	  "Graphics card": "GeForce 9200M G"
	},
	"0x0870": {
	  "Graphics card": "GeForce 9400M"
	},
	"0x0871": {
	  "Graphics card": "GeForce 9200"
	},
	"0x087A": {
	  "Graphics card": "GeForce 9400"
	},
	"0x0408": {
	  "Graphics card": "GeForce 9650M GS"
	},
	"0x0405": {
	  "Graphics card": "VMWare SVGA 3D Microsoft Corporation WDDM"
	},
	"0x0861": {
	  "Graphics card": "GeForce 9400M"
	},
	"0x0863": {
	  "Graphics card": "GeForce 9400M"
	},
	"0x042E": {
	  "Graphics card": "GeForce 9300M G"
	},
	"0x063A": {
	  "Graphics card": "NVIDIA Quadro FX 2700M"
	},
	"0x063F": {
	  "Graphics card": "NVIDIA G94"
	},
	"0x0658": {
	  "Graphics card": "NVIDIA Quadro FX 380"
	},
	"0x0659": {
	  "Graphics card": "NVIDIA Quadro FX 580"
	},
	"0x065A": {
	  "Graphics card": "NVIDIA Quadro FX 1700M"
	},
	"0x065D": {
	  "Graphics card": "NVIDIA G96"
	},
	"0x06EA": {
	  "Graphics card": "NVIDIA Quadro NVS 150M"
	},
	"0x06EB": {
	  "Graphics card": "NVIDIA Quadro NVS 160M"
	},
	"0x06FB": {
	  "Graphics card": "NVIDIA Quadro FX 370M"
	},
	"0x0874": {
	  "Graphics card": "NVIDIA ION"
	},
	"0x0876": {
	  "Graphics card": "NVIDIA ION"
	},
	"0x087D": {
	  "Graphics card": "NVIDIA ION"
	},
	"0x087E": {
	  "Graphics card": "NVIDIA ION LE"
	},
	"0x087F": {
	  "Graphics card": "NVIDIA ION LE"
	},
	"0x0A64": {
	  "Graphics card": "NVIDIA ION"
	},
	"0x0A6F": {
	  "Graphics card": "NVIDIA ION"
	},
	"0x0A76": {
	  "Graphics card": "NVIDIA ION"
	},
	"0x10D8": {
	  "Graphics card": "NVIDIA NVS 300"
	},
	"0x06FD": {
	  "Graphics card": "NVIDIA NVS 295"
	},
	"0x0191": {
	  "Graphics card": "GeForce 8800 GTX"
	},
	"0x0199": {
	  "Graphics card": "GeForce 8800 GTX"
	},
	"0x0193": {
	  "Graphics card": "GeForce 8800 GTS"
	},
	"0x0194": {
	  "Graphics card": "GeForce 8800 Ultra"
	},
	"0x019D": {
	  "Graphics card": "GeForce 8800"
	},
	"0x0600": {
	  "Graphics card": "GeForce 8800 GTS"
	},
	"0x0602": {
	  "Graphics card": "GeForce 8800 GT"
	},
	"0x0619": {
	  "Graphics card": "GeForce 8800 GT"
	},
	"0x0606": {
	  "Graphics card": "GeForce 8800 GS"
	},
	"0x0609": {
	  "Graphics card": "GeForce 8800 GS"
	},
	"0x060C": {
	  "Graphics card": "GeForce 8800M GTX"
	},
	"0x060D": {
	  "Graphics card": "GeForce 8800 GS"
	},
	"0x0611": {
	  "Graphics card": "GeForce 8800 GT"
	},
	"0x061A": {
	  "Graphics card": "GeForce 8800"
	},
	"0x06E2": {
	  "Graphics card": "GeForce 8300"
	},
	"0x06E3": {
	  "Graphics card": "GeForce 8300 GS"
	},
	"0x06E4": {
	  "Graphics card": "GeForce 8300 GS"
	},
	"0x040D": {
	  "Graphics card": "Quadro FX 1600M"
	},
	"0x0409": {
	  "Graphics card": "GeForce 8700M GT"
	},
	"0x0400": {
	  "Graphics card": "GeForce 8600 GTS"
	},
	"0x0401": {
	  "Graphics card": "GeForce 8600 GT"
	},
	"0x0402": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Desktop Haswell GT1"
	},
	"0x0403": {
	  "Graphics card": "GeForce 8600 GS"
	},
	"0x0407": {
	  "Graphics card": "GeForce 8600 Go"
	},
	"0x040A": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Server Haswell GT1"
	},
	"0x040E": {
	  "Graphics card": "GeForce 8600"
	},
	"0x040F": {
	  "Graphics card": "GeForce 8600"
	},
	"0x0425": {
	  "Graphics card": "GeForce 8600m GS"
	},
	"0x0421": {
	  "Graphics card": "GeForce 8500 GT"
	},
	"0x0427": {
	  "Graphics card": "GeForce 8400M GS"
	},
	"0x0426": {
	  "Graphics card": "GeForce 8400M GT"
	},
	"0x0428": {
	  "Graphics card": "GeForce 8400M G"
	},
	"0x0420": {
	  "Graphics card": "GeForce 8300 SE"
	},
	"0x0422": {
	  "Graphics card": "GeForce 8300 GS"
	},
	"0x0423": {
	  "Graphics card": "GeForce 8300 GS"
	},
	"0x0424": {
	  "Graphics card": "GeForce 8300 GS"
	},
	"0x0429": {
	  "Graphics card": "NVIDIA Quadro NVS 140M"
	},
	"0x042F": {
	  "Graphics card": "GeForce 8300"
	},
	"0x0404": {
	  "Graphics card": "GeForce 8300 GS"
	},
	"0x0848": {
	  "Graphics card": "GeForce 8300"
	},
	"0x0849": {
	  "Graphics card": "GeForce 8300"
	},
	"0x084B": {
	  "Graphics card": "GeForce 8300"
	},
	"0x084F": {
	  "Graphics card": "GeForce 8300"
	},
	"0x10C3": {
	  "Graphics card": "GeForce 8400GS"
	},
	"0x0845": {
	  "Graphics card": "NVIDIA GeForce 8200M G"
	},
	"0x06ED": {
	  "Graphics card": "NVIDIA G98"
	},
	"0x040B": {
	  "Graphics card": "NVIDIA Quadro NVS 320M"
	},
	"0x040C": {
	  "Graphics card": "NVIDIA Quadro FX 570M"
	},
	"0x042A": {
	  "Graphics card": "NVIDIA Quadro NVS 130M"
	},
	"0x042B": {
	  "Graphics card": "NVIDIA Quadro NVS 135M"
	},
	"0x042D": {
	  "Graphics card": "NVIDIA Quadro FX 360M"
	},
	"0x061B": {
	  "Graphics card": "NVIDIA Quadro VX 200"
	},
	"0x061C": {
	  "Graphics card": "NVIDIA Quadro FX 3600M"
	},
	"0x061D": {
	  "Graphics card": "NVIDIA Quadro FX 2800M"
	},
	"0x061E": {
	  "Graphics card": "NVIDIA Quadro FX 3700M"
	},
	"0x061F": {
	  "Graphics card": "NVIDIA Quadro FX 3800M"
	},
	"0x06F9": {
	  "Graphics card": "NVIDIA Quadro FX 370 LP"
	},
	"0x0A78": {
	  "Graphics card": "NVIDIA Quadro FX 380 LP"
	},
	"0x0293": {
	  "Graphics card": "GeForce 7950 GX2"
	},
	"0x0294": {
	  "Graphics card": "GeForce 7950 GX2"
	},
	"0x0295": {
	  "Graphics card": "GeForce 7950 GT"
	},
	"0x02E4": {
	  "Graphics card": "GeForce 7950 GT"
	},
	"0x0290": {
	  "Graphics card": "GeForce 7900 GTX"
	},
	"0x0291": {
	  "Graphics card": "GeForce 7900 GT"
	},
	"0x0292": {
	  "Graphics card": "GeForce 7900 GS"
	},
	"0x0297": {
	  "Graphics card": "GeForce Go 7950 GTX"
	},
	"0x0298": {
	  "Graphics card": "GeForce 7900 Go GS"
	},
	"0x0299": {
	  "Graphics card": "GeForce 7900 Go GTX"
	},
	"0x029C": {
	  "Graphics card": "GeForce 7900 Quadro"
	},
	"0x029D": {
	  "Graphics card": "GeForce 7900"
	},
	"0x029E": {
	  "Graphics card": "GeForce 7900"
	},
	"0x029F": {
	  "Graphics card": "GeForce 7900"
	},
	"0x02E3": {
	  "Graphics card": "GeForce 7900 GS"
	},
	"0x00F5": {
	  "Graphics card": "GeForce 7800 GS"
	},
	"0x0091": {
	  "Graphics card": "GeForce 7800 GTX"
	},
	"0x0092": {
	  "Graphics card": "GeForce 7800 GT"
	},
	"0x0093": {
	  "Graphics card": "GeForce 7800 GS"
	},
	"0x0095": {
	  "Graphics card": "GeForce 7800 SLI"
	},
	"0x0098": {
	  "Graphics card": "GeForce 7800 Go"
	},
	"0x0099": {
	  "Graphics card": "GeForce 7800 Go GTX"
	},
	"0x0090": {
	  "Graphics card": "GeForce 7800 GTX"
	},
	"0x019E": {
	  "Graphics card": "GeForce 7800"
	},
	"0x02E1": {
	  "Graphics card": "GeForce 7600 GS"
	},
	"0x0390": {
	  "Graphics card": "GeForce 7600 GS"
	},
	"0x0391": {
	  "Graphics card": "GeForce 7600 GT"
	},
	"0x0392": {
	  "Graphics card": "GeForce 7600 GS"
	},
	"0x0394": {
	  "Graphics card": "GeForce 7600 LE"
	},
	"0x039E": {
	  "Graphics card": "GeForce 7600"
	},
	"0x02E0": {
	  "Graphics card": "GeForce 7600 GT"
	},
	"0x0398": {
	  "Graphics card": "GeForce 7600 Go"
	},
	"0x016A": {
	  "Graphics card": "Server IvyBridge GT2"
	},
	"0x01D0": {
	  "Graphics card": "GeForce 7300 LE"
	},
	"0x01D1": {
	  "Graphics card": "GeForce 7300 LE"
	},
	"0x01D3": {
	  "Graphics card": "GeForce 7300 SE"
	},
	"0x01DD": {
	  "Graphics card": "GeForce 7300 LE"
	},
	"0x01DE": {
	  "Graphics card": "GeForce 7300"
	},
	"0x01DF": {
	  "Graphics card": "GeForce 7300 GS"
	},
	"0x0393": {
	  "Graphics card": "GeForce 7300 GT"
	},
	"0x0395": {
	  "Graphics card": "GeForce 7300 GT"
	},
	"0x02E2": {
	  "Graphics card": "GeForce 7300 GT"
	},
	"0x01D9": {
	  "Graphics card": "GeForce 7300 LE"
	},
	"0x053A": {
	  "Graphics card": "GeForce 7300"
	},
	"0x053B": {
	  "Graphics card": "GeForce 7300"
	},
	"0x053E": {
	  "Graphics card": "GeForce 7300"
	},
	"0x07E0": {
	  "Graphics card": "GeForce 7300"
	},
	"0x07E1": {
	  "Graphics card": "GeForce 7300"
	},
	"0x07E2": {
	  "Graphics card": "GeForce 7300"
	},
	"0x07E3": {
	  "Graphics card": "GeForce 7300"
	},
	"0x07E5": {
	  "Graphics card": "GeForce 7300"
	},
	"0x084A": {
	  "Graphics card": "GeForce 7300"
	},
	"0x084C": {
	  "Graphics card": "GeForce 7300"
	},
	"0x084D": {
	  "Graphics card": "GeForce 7300"
	},
	"0x0397": {
	  "Graphics card": "GeForce Go 7700"
	},
	"0x0399": {
	  "Graphics card": "GeForce Go 7600 GT"
	},
	"0x01D8": {
	  "Graphics card": "GeForce Go 7400"
	},
	"0x01D7": {
	  "Graphics card": "GeForce Go 7300"
	},
	"0x01D6": {
	  "Graphics card": "GeForce Go 7200"
	},
	"0x01DC": {
	  "Graphics card": "NVIDIA Quadro FX 350M"
	},
	"0x039A": {
	  "Graphics card": "NVIDIA Quadro NVS 300M"
	},
	"0x029B": {
	  "Graphics card": "NVIDIA Quadro FX 1500M"
	},
	"0x039D": {
	  "Graphics card": "NVIDIA G73GL"
	},
	"0x03D6": {
	  "Graphics card": "NVIDIA GeForce 7025 / NVIDIA nForce 630a"
	},
	"0x0530": {
	  "Graphics card": "NVIDIA GeForce 7190M / nForce 650M"
	},
	"0x0531": {
	  "Graphics card": "NVIDIA_GeForce 7150M nForce_630M"
	},
	"0x0533": {
	  "Graphics card": "NVIDIA GeForce 7000M / nForce 610M"
	},
	"0x0040": {
	  "Graphics card": "GeForce 6800 Ultra"
	},
	"0x0041": {
	  "Graphics card": "GeForce 6800"
	},
	"0x0042": {
	  "Graphics card": "Intel HD Graphics"
	},
	"0x0043": {
	  "Graphics card": "GeForce 6800"
	},
	"0x0044": {
	  "Graphics card": "GeForce 6800 XT"
	},
	"0x0045": {
	  "Graphics card": "GeForce 6800 GT"
	},
	"0x0046": {
	  "Graphics card": "Intel HD Graphics"
	},
	"0x0047": {
	  "Graphics card": "GeForce 6800 GS"
	},
	"0x0048": {
	  "Graphics card": "GeForce 6800 XT"
	},
	"0x0049": {
	  "Graphics card": "GeForce 6800 GL"
	},
	"0x004E": {
	  "Graphics card": "GeForce 6800 Quadro"
	},
	"0x00F6": {
	  "Graphics card": "GeForce 6800 GS"
	},
	"0x00C0": {
	  "Graphics card": "GeForce 6800"
	},
	"0x00C1": {
	  "Graphics card": "GeForce 6800"
	},
	"0x00C2": {
	  "Graphics card": "GeForce 6800 LE"
	},
	"0x00C3": {
	  "Graphics card": "GeForce 6800 XT"
	},
	"0x00C8": {
	  "Graphics card": "GeForce 6800 Go"
	},
	"0x00C4": {
	  "Graphics card": "GeForce 6800 Go"
	},
	"0x00C9": {
	  "Graphics card": "GeForce 6800 Go Ultra"
	},
	"0x00F0": {
	  "Graphics card": "GeForce 6800"
	},
	"0x00F8": {
	  "Graphics card": "GeForce 6800 Quadro"
	},
	"0x00F9": {
	  "Graphics card": "GeForce 6800 Series GPU"
	},
	"0x0211": {
	  "Graphics card": "GeForce 6800"
	},
	"0x0212": {
	  "Graphics card": "GeForce 6800 LE"
	},
	"0x0215": {
	  "Graphics card": "GeForce 6800 GT"
	},
	"0x0218": {
	  "Graphics card": "GeForce 6800 XT"
	},
	"0x00F4": {
	  "Graphics card": "GeForce 6600 LE"
	},
	"0x00F1": {
	  "Graphics card": "GeForce 6600 GT"
	},
	"0x00F2": {
	  "Graphics card": "GeForce 6600"
	},
	"0x0140": {
	  "Graphics card": "GeForce 6600 GT"
	},
	"0x0141": {
	  "Graphics card": "GeForce 6600"
	},
	"0x0142": {
	  "Graphics card": "GeForce 6600 NV43"
	},
	"0x0143": {
	  "Graphics card": "GeForce 6600 NV43"
	},
	"0x0144": {
	  "Graphics card": "GeForce Go 6600"
	},
	"0x0145": {
	  "Graphics card": "GeForce 6610 XL"
	},
	"0x0147": {
	  "Graphics card": "GeForce 6600 NV43"
	},
	"0x0148": {
	  "Graphics card": "GeForce Go 6600"
	},
	"0x0149": {
	  "Graphics card": "GeForce 6600"
	},
	"0x014A": {
	  "Graphics card": "GeForce 6600"
	},
	"0x014B": {
	  "Graphics card": "GeForce 6600"
	},
	"0x014C": {
	  "Graphics card": "GeForce 6600 GL"
	},
	"0x014D": {
	  "Graphics card": "GeForce 6600 GL"
	},
	"0x014F": {
	  "Graphics card": "GeForce 6200"
	},
	"0x0160": {
	  "Graphics card": "GeForce 6200 NV44"
	},
	"0x0161": {
	  "Graphics card": "GeForce 6200 TC"
	},
	"0x0162": {
	  "Graphics card": "Desktop IvyBridge GT2"
	},
	"0x0163": {
	  "Graphics card": "GeForce 6200 LE NV44"
	},
	"0x0164": {
	  "Graphics card": "GeForce 6200 Go"
	},
	"0x0165": {
	  "Graphics card": "GeForce 6200 Go"
	},
	"0x0167": {
	  "Graphics card": "GeForce 6200 Go NV44M"
	},
	"0x0168": {
	  "Graphics card": "GeForce 6200 Go"
	},
	"0x0169": {
	  "Graphics card": "GeForce 6200 Go NV44M"
	},
	"0x016B": {
	  "Graphics card": "GeForce 6200 Go NV44M"
	},
	"0x016C": {
	  "Graphics card": "GeForce 6200 Go NV44M"
	},
	"0x016D": {
	  "Graphics card": "GeForce 6200 Go NV44M"
	},
	"0x016E": {
	  "Graphics card": "GeForce 6200 NV44"
	},
	"0x0220": {
	  "Graphics card": "GeForce 6200 NV44"
	},
	"0x0221": {
	  "Graphics card": "GeForce 6200 NV44"
	},
	"0x0222": {
	  "Graphics card": "GeForce 6200 NV44"
	},
	"0x0228": {
	  "Graphics card": "GeForce 6200 Go NV44M"
	},
	"0x00F3": {
	  "Graphics card": "GeForce 6200"
	},
	"0x022A": {
	  "Graphics card": "GeForce 6200 LE"
	},
	"0x032E": {
	  "Graphics card": "GeForce 6200"
	},
	"0x0146": {
	  "Graphics card": "NVIDIA GeForce Go 6200 TE 64M / 6600 TE 128M"
	},
	"0x0240": {
	  "Graphics card": "GeForce 6100"
	},
	"0x0241": {
	  "Graphics card": "GeForce 6100"
	},
	"0x0242": {
	  "Graphics card": "GeForce 6100"
	},
	"0x0245": {
	  "Graphics card": "GeForce 6100"
	},
	"0x029A": {
	  "Graphics card": "GeForce 6100"
	},
	"0x03D0": {
	  "Graphics card": "GeForce 6100 nForce 430"
	},
	"0x03D1": {
	  "Graphics card": "GeForce 6100 nForce 405"
	},
	"0x03D2": {
	  "Graphics card": "GeForce 6100 nForce 400"
	},
	"0x03D5": {
	  "Graphics card": "GeForce 6100"
	},
	"0x0244": {
	  "Graphics card": "GeForce GO 6150"
	},
	"0x0247": {
	  "Graphics card": "GeForce Go 6100"
	},
	"0x0333": {
	  "Graphics card": "GeForce 5950 Ultra"
	},
	"0x00FB": {
	  "Graphics card": "GeForce 5900"
	},
	"0x0332": {
	  "Graphics card": "GeForceFX 5900 NV35"
	},
	"0x0334": {
	  "Graphics card": "GeForce 5900 ZT"
	},
	"0x0338": {
	  "Graphics card": "GeForce 5900 Quadro"
	},
	"0x033F": {
	  "Graphics card": "GeForce 5900 Quadro"
	},
	"0x0330": {
	  "Graphics card": "GeForce 5900 Ultra"
	},
	"0x0331": {
	  "Graphics card": "GeForce 5900"
	},
	"0x034C": {
	  "Graphics card": "GeForce 5800 Go Quadro"
	},
	"0x0301": {
	  "Graphics card": "GeForce 5800 Ultra"
	},
	"0x0302": {
	  "Graphics card": "GeForce 5800"
	},
	"0x00FA": {
	  "Graphics card": "GeForce 5700"
	},
	"0x0341": {
	  "Graphics card": "GeForceFX 5700 Ultra"
	},
	"0x0342": {
	  "Graphics card": "GeForceFX 5700"
	},
	"0x0343": {
	  "Graphics card": "GeForceFX 5700LE"
	},
	"0x0344": {
	  "Graphics card": "GeForceFX 5700VE"
	},
	"0x0345": {
	  "Graphics card": "GeForce 5700"
	},
	"0x0347": {
	  "Graphics card": "GeForceFX Go5700"
	},
	"0x0348": {
	  "Graphics card": "GeForceFX Go5700"
	},
	"0x0349": {
	  "Graphics card": "GeForce 5700 Pro"
	},
	"0x034B": {
	  "Graphics card": "GeForce 5700"
	},
	"0x034E": {
	  "Graphics card": "GeForce 5700 Quadro"
	},
	"0x034F": {
	  "Graphics card": "GeForce 5700 GL"
	},
	"0x034A": {
	  "Graphics card": "NVIDIA GeForce FX 5700LE (Microsoft Corporation)"
	},
	"0x0308": {
	  "Graphics card": "GeForceFX 5600 QuadroFX 2000"
	},
	"0x0309": {
	  "Graphics card": "GeForceFX 5600 QuadroFX 1000"
	},
	"0x030A": {
	  "Graphics card": "GeForceFX 5600 ICE FX 2000"
	},
	"0x0311": {
	  "Graphics card": "GeForceFX 5600 Ultra"
	},
	"0x0312": {
	  "Graphics card": "GeForceFX 5600"
	},
	"0x0313": {
	  "Graphics card": "GeForceFX 5600 NV31"
	},
	"0x0314": {
	  "Graphics card": "GeForceFX 5600SE"
	},
	"0x0316": {
	  "Graphics card": "GeForceFX Go 5600 NV31M"
	},
	"0x0317": {
	  "Graphics card": "GeForceFX Go 5600 NV31M Pro"
	},
	"0x031A": {
	  "Graphics card": "GeForceFX Go 5600"
	},
	"0x031B": {
	  "Graphics card": "GeForceFX Go 5650"
	},
	"0x031C": {
	  "Graphics card": "GeForceFX Go 5600 Quadro FX Go700"
	},
	"0x031D": {
	  "Graphics card": "GeForceFX Go 5600 NV31GLM"
	},
	"0x031E": {
	  "Graphics card": "GeForceFX Go 5600 NV31GLM Pro"
	},
	"0x031F": {
	  "Graphics card": "GeForceFX Go 5600 NV31GLM Pro"
	},
	"0x0329": {
	  "Graphics card": "GeForce 5600"
	},
	"0x032A": {
	  "Graphics card": "GeForceFX 5600 NV34GL"
	},
	"0x032B": {
	  "Graphics card": "GeForceFX 5600 Quadro FX 500"
	},
	"0x032F": {
	  "Graphics card": "GeForceFX 5600 NV34GL"
	},
	"0x0326": {
	  "Graphics card": "GeForce 5600"
	},
	"0x032C": {
	  "Graphics card": "GeForceFX Go 53xx"
	},
	"0x00FC": {
	  "Graphics card": "GeForce 5200"
	},
	"0x00FD": {
	  "Graphics card": "GeForce 5200 Quadro"
	},
	"0x0320": {
	  "Graphics card": "GeForce 5200"
	},
	"0x0321": {
	  "Graphics card": "GeForce 5200 Ultra"
	},
	"0x0322": {
	  "Graphics card": "GeForce 5200"
	},
	"0x0323": {
	  "Graphics card": "GeForce 5200 SE"
	},
	"0x0324": {
	  "Graphics card": "GeForce 5200 Go"
	},
	"0x0328": {
	  "Graphics card": "GeForce 5200 Go"
	},
	"0x0325": {
	  "Graphics card": "GeForce 5200 Go"
	},
	"0x0327": {
	  "Graphics card": "GeForce 5200"
	},
	"0x032D": {
	  "Graphics card": "GeForce 5200 Go"
	},
	"0x009D": {
	  "Graphics card": "GeForceFX Quadro FX 4500"
	},
	"0x00CC": {
	  "Graphics card": "GeForceFX Quadro FX Go1400"
	},
	"0x00CD": {
	  "Graphics card": "GeForceFX Quadro FX 3450/4000 SDI"
	},
	"0x00CE": {
	  "Graphics card": "GeForceFX Quadro FX 1400"
	},
	"0x00FE": {
	  "Graphics card": "GeForceFX QuadroFX 1300"
	},
	"0x00FF": {
	  "Graphics card": "GeForceFX PCX 4300"
	},
	"0x014E": {
	  "Graphics card": "GeForceFX Quadro FX 540"
	},
	"0x0170": {
	  "Graphics card": "GeForce4 MX 460"
	},
	"0x0171": {
	  "Graphics card": "GeForce4 MX 440"
	},
	"0x0172": {
	  "Graphics card": "GeForce4 MX 420"
	},
	"0x0173": {
	  "Graphics card": "GeForce4 MX 440-SE"
	},
	"0x0174": {
	  "Graphics card": "GeForce4 440 Go"
	},
	"0x0175": {
	  "Graphics card": "GeForce4 420 Go"
	},
	"0x0176": {
	  "Graphics card": "GeForce4 420 Go 32M"
	},
	"0x0177": {
	  "Graphics card": "GeForce4 460 Go"
	},
	"0x0178": {
	  "Graphics card": "GeForce4 Quadro4 550 XGL"
	},
	"0x0179": {
	  "Graphics card": "GeForce4 440 Go 64M"
	},
	"0x017A": {
	  "Graphics card": "GeForce4 Quadro NVS"
	},
	"0x017B": {
	  "Graphics card": "GeForce4 Quadro"
	},
	"0x017C": {
	  "Graphics card": "GeForce4 Quadro 500 GoGL"
	},
	"0x017D": {
	  "Graphics card": "GeForce4 410 Go 16M"
	},
	"0x0181": {
	  "Graphics card": "GeForce4 MX 440 with AGP8X"
	},
	"0x0182": {
	  "Graphics card": "GeForce4 MX 440SE with AGP8X"
	},
	"0x0183": {
	  "Graphics card": "GeForce4 MX 420 with AGP8X"
	},
	"0x0185": {
	  "Graphics card": "GeForce4 MX 4000"
	},
	"0x0186": {
	  "Graphics card": "GeForce4 448 Go"
	},
	"0x0187": {
	  "Graphics card": "GeForce4 488 Go"
	},
	"0x0188": {
	  "Graphics card": "GeForce4 Quadro4 580 XGL"
	},
	"0x018A": {
	  "Graphics card": "GeForce4 Quadro4 NVS with AGP8X"
	},
	"0x018B": {
	  "Graphics card": "GeForce4 Quadro4 380 XGL"
	},
	"0x018D": {
	  "Graphics card": "GeForce4 448 Go"
	},
	"0x01F0": {
	  "Graphics card": "GeForce4 MX Integrated GPU"
	},
	"0x0250": {
	  "Graphics card": "GeForce4 Ti 4600"
	},
	"0x0251": {
	  "Graphics card": "GeForce4 Ti 4400"
	},
	"0x0252": {
	  "Graphics card": "GeForce4 Ti 4400 NV25"
	},
	"0x0253": {
	  "Graphics card": "GeForce4 Ti 4200"
	},
	"0x0258": {
	  "Graphics card": "GeForce4 Quadro4 900 XGL"
	},
	"0x0259": {
	  "Graphics card": "GeForce4 Quadro4 750 XGL"
	},
	"0x025B": {
	  "Graphics card": "GeForce4 Quadro4 700 XGL"
	},
	"0x0280": {
	  "Graphics card": "GeForce4 Ti 4800"
	},
	"0x0281": {
	  "Graphics card": "GeForce4 Ti 4200 with AGP8X"
	},
	"0x0282": {
	  "Graphics card": "GeForce4 Ti 4800 SE"
	},
	"0x0286": {
	  "Graphics card": "GeForce4 4200 Go"
	},
	"0x0288": {
	  "Graphics card": "GeForce4 Quadro4 980 XGL"
	},
	"0x0289": {
	  "Graphics card": "GeForce4 Quadro4 780 XGL"
	},
	"0x028C": {
	  "Graphics card": "GeForce4 Quadro4 700 GoGL"
	},
	"0x02A0": {
	  "Graphics card": "GeForce3 XBOX"
	},
	"0x0200": {
	  "Graphics card": "GeForce3"
	},
	"0x0201": {
	  "Graphics card": "GeForce3 Ti 200"
	},
	"0x0202": {
	  "Graphics card": "GeForce3 Ti 500"
	},
	"0x0203": {
	  "Graphics card": "GeForce3 Quadro DCC"
	},
	"0x01A0": {
	  "Graphics card": "GeForce2 Integrated GPU"
	},
	"0x0110": {
	  "Graphics card": "GeForce2 MX/MX 400"
	},
	"0x0111": {
	  "Graphics card": "GeForce2 MX 100/200"
	},
	"0x0112": {
	  "Graphics card": "Desktop SandyBridge GT2"
	},
	"0x0113": {
	  "Graphics card": "GeForce2 Quadro MXR/EX/Go"
	},
	"0x0150": {
	  "Graphics card": "GeForce2 GTS/GeForce2 Pro"
	},
	"0x0151": {
	  "Graphics card": "GeForce2 Ti"
	},
	"0x0152": {
	  "Graphics card": "Desktop IvyBridge GT1"
	},
	"0x0153": {
	  "Graphics card": "GeForce2 Quadro2 Pro"
	},
	"0x0100": {
	  "Graphics card": "GeForce 256"
	},
	"0x0101": {
	  "Graphics card": "GeForce 256 DDR"
	},
	"0x0102": {
	  "Graphics card": "Desktop SandyBridge GT1"
	},
	"0x0103": {
	  "Graphics card": "GeForce 256 Quadro"
	},
	"0x0008": {
	  "Graphics card": "NV 1"
	},
	"0x0009": {
	  "Graphics card": "NV 1"
	},
	"0x0010": {
	  "Graphics card": "NV 2"
	},
	"0x0018": {
	  "Graphics card": "Riva 128"
	},
	"0x0019": {
	  "Graphics card": "Riva 128 ZX"
	},
	"0x00A0": {
	  "Graphics card": "TNT2 Aladdin"
	},
	"0x0028": {
	  "Graphics card": "TNT2/TNT2 Pro"
	},
	"0x0029": {
	  "Graphics card": "TNT2 Ultra"
	},
	"0x002A": {
	  "Graphics card": "TNT2"
	},
	"0x002B": {
	  "Graphics card": "TNT2"
	},
	"0x002D": {
	  "Graphics card": "TNT2 Model 64/Model 64 Pro"
	},
	"0x0020": {
	  "Graphics card": "TNT"
	},
	"0x002C": {
	  "Graphics card": "TNT Vanta/Vanta LT"
	},
	"0x002E": {
	  "Graphics card": "TNT Vanta"
	},
	"0x002F": {
	  "Graphics card": "TNT Vanta"
	},
	"0x1B1D": {
	  "Graphics card": "Riva 128"
	},
	"0x2A42": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2A43": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E02": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X4500HD"
	},
	"0x2E03": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X4500HD"
	},
	"0x2E22": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X4500"
	},
	"0x2E23": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X4500"
	},
	"0x2E12": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E13": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E32": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E33": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E42": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E43": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E92": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x2E93": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 4500"
	},
	"0x08CF": {
	  "Graphics card": "Intel HD Graphics"
	},
	"0x0F31": {
	  "Graphics card": "Mobile SandyBridge GT1"
	},
	"0x0106": {
	  "Graphics card": "Mobile SandyBridge GT1"
	},
	"0x010A": {
	  "Graphics card": "Server SandyBridge"
	},
	"0x0122": {
	  "Graphics card": "Desktop SandyBridge GT2+"
	},
	"0x0116": {
	  "Graphics card": "Mobile SandyBridge GT2"
	},
	"0x0126": {
	  "Graphics card": "Mobile SandyBridge GT2+"
	},
	"0x0156": {
	  "Graphics card": "Mobile IvyBridge GT1"
	},
	"0x015A": {
	  "Graphics card": "Server IvyBridge GT1"
	},
	"0x015E": {
	  "Graphics card": "Reserved - IvyBridge GT1"
	},
	"0x0166": {
	  "Graphics card": "Mobile IvyBridge GT2"
	},
	"0x0406": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Mobile Haswell GT1"
	},
	"0x0412": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 4600 - Desktop Haswell GT2"
	},
	"0x0416": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Mobile Haswell GT2"
	},
	"0x041B": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Workstation Haswell GT2"
	},
	"0x041A": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Server Haswell GT2"
	},
	"0x041E": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 4400 - Reserved Haswell"
	},
	"0x0A06": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Mobile Haswell - ULT GT1"
	},
	"0x0A0E": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Reserved Haswell - ULT GT1"
	},
	"0x0A16": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 4400 - Mobile Haswell - ULT GT2"
	},
	"0x0A1E": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 4200 - Mobile Haswell - ULT GT2"
	},
	"0x0A2E": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 5100 Iris - Mobile Haswell - ULT GT3"
	},
	"0x0D12": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics - Mobile Haswell - ULT GT2"
	},
	"0x0D16": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 4600 - Mobile Haswell - ULT GT2"
	},
	"0x161E": {
	  "Graphics card": "Intel(R) HD Graphics 5300"
	},
	"0x1616": {
	  "Graphics card": "Intel(R) HD Graphics 5500"
	},
	"0x1612": {
	  "Graphics card": "Intel(R) HD Graphics 5600"
	},
	"0x0D22": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 5200 Iris Pro - Desktop GT3"
	},
	"0x0D26": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics HD 5200 Iris Pro - Mobile GT3"
	},
	"0x0D2A": {
	  "Graphics card": "4th Gen Intel(R) Core processor graphics Iris Pro - Server GT3"
	},
	"0x1606": {
	  "Graphics card": "Intel Broadwell HD Graphics M ULT GT1"
	},
	"0x1626": {
	  "Graphics card": "Intel (R) Iris Graphics 6000"
	},
	"0x162B": {
	  "Graphics card": "Intel (R) Iris Graphics 6100"
	},
	"0x1622": {
	  "Graphics card": "Intel (R) Iris Graphics 6200"
	},
	"0x193D": {
	  "Graphics card": "Intel (R) Iris R Pro Graphics P580"
	},
	"0x193B": {
	  "Graphics card": "Intel (R) Iris R Pro Graphics 580"
	},
	"0x1927": {
	  "Graphics card": "Intel (R) HD 550"
	},
	"0x1926": {
	  "Graphics card": "Intel (R) HD 540"
	},
	"0x1912": {
	  "Graphics card": "Intel (R) HD 530"
	},
	"0x191B": {
	  "Graphics card": "Intel (R) HD 530"
	},
	"0x1921": {
	  "Graphics card": "Intel (R) HD 520"
	},
	"0x1916": {
	  "Graphics card": "Intel (R) HD 520"
	},
	"0x191E": {
	  "Graphics card": "Intel (R) HD 515"
	},
	"0x1906": {
	  "Graphics card": "Intel (R) HD 510"
	},
	"0x1902": {
	  "Graphics card": "Intel (R) HD 510"
	},
	"0x191D": {
	  "Graphics card": "Intel (R) HD P530"
	},
	"0x3185": {
	  "Graphics card": "Intel (R) UHD 600"
	},
	"0x3184": {
	  "Graphics card": "Intel (R) UHD 605"
	},
	"0x3E93": {
	  "Graphics card": "Intel (R) UHD 610"
	},
	"0x3EA1": {
	  "Graphics card": "Intel (R) UHD 610"
	},
	"0x3E90": {
	  "Graphics card": "Intel (R) UHD 610"
	},
	"0x9BA8": {
	  "Graphics card": "Intel (R) UHD 610"
	},
	"0x591E": {
	  "Graphics card": "Intel (R) UHD 615"
	},
	"0x591C": {
	  "Graphics card": "Intel (R) UHD 615"
	},
	"0x87C0": {
	  "Graphics card": "Intel (R) UHD 617"
	},
	"0x5916": {
	  "Graphics card": "Intel (R) UHD 620"
	},
	"0x5917": {
	  "Graphics card": "Intel (R) UHD 620"
	},
	"0x3EA0": {
	  "Graphics card": "Intel (R) UHD 620"
	},
	"0x5906": {
	  "Graphics card": "Intel (R) HD 610"
	},
	"0x5921": {
	  "Graphics card": "Intel (R) HD 620"
	},
	"0x3EA9": {
	  "Graphics card": "Intel (R) HD 620"
	},
	"0x5902": {
	  "Graphics card": "Intel (R) HD 630"
	},
	"0x5912": {
	  "Graphics card": "Intel (R) HD 630"
	},
	"0x591B": {
	  "Graphics card": "Intel (R) HD 630"
	},
	"0x591D": {
	  "Graphics card": "Intel (R) HD Graphics P630"
	},
	"0x3E94": {
	  "Graphics card": "Intel (R) HD Graphics P630"
	},
	"0x9BF6": {
	  "Graphics card": "Intel (R) UHD Graphics P630"
	},
	"0x3E96": {
	  "Graphics card": "Intel (R) UHD Graphics P630"
	},
	"0x3E91": {
	  "Graphics card": "Intel (R) UHD 630"
	},
	"0x3E92": {
	  "Graphics card": "Intel (R) UHD 630"
	},
	"0x3E98": {
	  "Graphics card": "Intel (R) UHD 630"
	},
	"0x3E9B": {
	  "Graphics card": "Intel (R) UHD 630"
	},
	"0x9BC4": {
	  "Graphics card": "Intel (R) UHD 630"
	},
	"0x9BC5": {
	  "Graphics card": "Intel (R) UHD 630"
	},
	"0x9BC8": {
	  "Graphics card": "Intel (R) UHD 630"
	},
	"0x5926": {
	  "Graphics card": "Intel (R) HD 640"
	},
	"0x3EA6": {
	  "Graphics card": "Intel (R) HD 645"
	},
	"0x3EA5": {
	  "Graphics card": "Inte Iris Plus Graphics 655"
	},
	"0x5927": {
	  "Graphics card": "Intel (R) HD 650"
	},
	"0x9841": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9BCA": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9BAA": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9840": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x87CA": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9B21": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9B41": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x4905": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9BA4": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9BCC": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9A68": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x9A78": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x4E55": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x4E61": {
	  "Graphics card": "Intel (R) UHD Graphics"
	},
	"0x8A53": {
	  "Graphics card": "Intel Iris Plus Graphics"
	},
	"0x8A56": {
	  "Graphics card": "Intel Iris Plus Graphics G1"
	},
	"0x8A58": {
	  "Graphics card": "Intel Iris Plus Graphics G1"
	},
	"0x8A5C": {
	  "Graphics card": "Intel Iris Plus Graphics G4"
	},
	"0x8A5A": {
	  "Graphics card": "Intel Iris Plus Graphics G4"
	},
	"0x8A51": {
	  "Graphics card": "Intel Iris Plus Graphics G7"
	},
	"0x8A52": {
	  "Graphics card": "Intel Iris Plus Graphics G7"
	},
	"0x4C8A": {
	  "Graphics card": "Intel (R) UHD 750"
	},
	"0x4C8B": {
	  "Graphics card": "Intel (R) UHD 730"
	},
	"0x9A49": {
	  "Graphics card": "Intel R Iris Xe Graphics"
	},
	"0x9A40": {
	  "Graphics card": "Intel R Iris Xe Graphics"
	},
	"0x2982": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X3500"
	},
	"0x2983": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X3500"
	},
	"0x0BE1": {
	  "Graphics card": "Intel(R) Graphics Media Accelerator 3600 Series"
	},
	"0x0BE2": {
	  "Graphics card": "Intel(R) Graphics Media Accelerator 3600 Series"
	},
	"0x2A02": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X3100 Crestline"
	},
	"0x2A03": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X3100 Crestline"
	},
	"0x2A12": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X3100 Crestline"
	},
	"0x2A13": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator X3100 Crestline"
	},
	"0x2972": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3000"
	},
	"0x2973": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3000"
	},
	"0x29B2": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3100"
	},
	"0x29B3": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3100"
	},
	"0x29C2": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3100"
	},
	"0x29C3": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3100"
	},
	"0x29D2": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3100"
	},
	"0x29D3": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3100"
	},
	"0x2992": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3000"
	},
	"0x2993": {
	  "Graphics card": "IntelВ� Graphics Media Accelerator 3000"
	},
	"0x29A2": {
	  "Graphics card": "GMA 3000 (G965 Express Chipset Family)"
	},
	"0x29A3": {
	  "Graphics card": "GMA 3000 (G965 Express Chipset Family)"
	},
	"0x2772": {
	  "Graphics card": "945 (82945G Express Chipset Family Graphics Controller)"
	},
	"0x2776": {
	  "Graphics card": "945 (82945G Express Chipset Family Graphics Controller)"
	},
	"0x27A2": {
	  "Graphics card": "945 Mobile"
	},
	"0x27A6": {
	  "Graphics card": "945 Mobile"
	},
	"0x27AE": {
	  "Graphics card": "Mobile Intel(R) 945 Express Chipset Family"
	},
	"0x2582": {
	  "Graphics card": "915 (82915G Express Chipset Family Graphics Controller)"
	},
	"0x2792": {
	  "Graphics card": "915 Mobile"
	},
	"0x2782": {
	  "Graphics card": "915 (82915G Express Chipset Family Graphics Controller"
	},
	"0x2592": {
	  "Graphics card": "915 Mobile"
	},
	"0x2572": {
	  "Graphics card": "865 (82865G Integrated Graphics Device)"
	},
	"0x3582": {
	  "Graphics card": "855 (82852/855GM Integrated Graphics Device)"
	},
	"0x2562": {
	  "Graphics card": "845 (82845G/GL[Brookdale-G]/GE Chipset Integrated Graphics Device)"
	},
	"0x3577": {
	  "Graphics card": "830 (82830 Chipset Graphics Controller)"
	},
	"0x1132": {
	  "Graphics card": "815 (82815 Chipset Graphics Controller)"
	},
	"0x7121": {
	  "Graphics card": "810 (82810 Chipset Graphics Controller)"
	},
	"0x7123": {
	  "Graphics card": "810 (82810 DC-100 Chipset Graphics Controller)"
	},
	"0x7126": {
	  "Graphics card": "810 (82810 DC-133 System and Graphics Controller)"
	},
	"0x7127": {
	  "Graphics card": "810 (82810 Chipset Graphics Controller)"
	},
	"0x1240": {
	  "Graphics card": "752 (82752 AGP Graphics Accelerator)"
	},
	"0x7800": {
	  "Graphics card": "740 (82740 (i740) AGP Graphics Accelerator)"
	},
	"0x4102": {
	  "Graphics card": "Intel(R) Graphics Media Accelerator 600"
	},
	"0xA001": {
	  "Graphics card": "Intel(R) NetTop Atom D410 (GMA 3150)"
	},
	"0xA002": {
	  "Graphics card": "Intel(R) NetTop Atom D510 (GMA 3150)"
	},
	"0xA011": {
	  "Graphics card": "Intel(R) NetBook Atom N4x0 (GMA 3150)"
	},
	"0xA012": {
	  "Graphics card": "Intel(R) NetBook Atom N4x0 (GMA 3150)"
	},
	"0x22B0": {
	  "Graphics card": "Intel(R) Cherryview Ultrabook"
	},
	"0x22B1": {
	  "Graphics card": "Intel(R) Cherryview Ultrabook"
	},
	"0x5A85": {
	  "Graphics card": "Intel(R) Apollo Lake Ultrabook"
	},
	"0x5A84": {
	  "Graphics card": "Intel(R) Apollo Lake Ultrabook"
	},
	"0x8108": {
	  "Graphics card": "Intel(R) GMA 500 (Poulsbo) on MID platforms"
	},
	"0x8109": {
	  "Graphics card": "Intel(R) GMA 500 (Poulsbo) on MID platforms"
	},
	"0x0540": {
	  "Graphics card": "Matrox M9120 PCIe x16"
	},
	"0x9045": {
	  "Graphics card": "Chrome 440 GTX"
	},
	"0xBEEF": {
	  "Graphics card": "VirtualBox Graphics Adapter for Windows Vista and 7"
	},
	"0x4005": {
	  "Graphics card": "Parallels Display Adapter WDDM"
	},
	"0x0000": {
	  "Graphics card": "Google SwiftShader 3D Renderer"
	},
	"0x008C": {
	  "Graphics card": "Microsoft Basic Render Driver"
	}
  }

var pcieGenLookup = {
	1: {
		"0.25" : 1,
		"0.5" : 2,
		"1.0" : 3,
		"2.0" : 4,
		"4.0" : 5,
		"8.0" : 6
	},
	2: {
		"0.5" : 1,
		"1.0" : 2,
		"2.0" : 3,
		"4.0" : 4,
		"8.0" : 5,
		"16.0" : 6
	},
	4: {
		"1.0" : 1,
		"2.0" : 2,
		"4.0" : 3,
		"8.0" : 4,
		"16.0" : 5,
		"32.0" : 6
	},
	8: {
		"2.0" : 1,
		"4.0" : 2,
		"8.0" : 3,
		"16.0" : 4,
		"32.0" : 5,
		"64.0" : 6
	},
	16: {
		"4.0" : 1,
		"8.0" : 2,
		"16.0" : 3,
		"32.0" : 4,
		"64.0" : 5,
		"128.0" : 6
	}
}

function parseUnit(val){
	if(typeof val == "number"){
		return val
	}
	
	if(typeof val != "string"){
		return NaN
	}
	var spl = val.split(/[ \/]/g)
	var numericalValue = parseFloat(spl[0])
	var unit = spl[1]
	if(unit.indexOf("KB") == 0){
		numericalValue *= 1000
	}
	if(unit.indexOf("MB") == 0){
		numericalValue *= 1000000
	}
	if(unit.indexOf("GB") == 0){
		numericalValue *= 10000000000
	}
	if(unit.indexOf("KiB") == 0){
		numericalValue *= 1024
	}
	if(unit.indexOf("MiB") == 0){
		numericalValue *= 1024*1024
	}
	if(unit.indexOf("GiB") == 0){
		numericalValue *= 1024*1024*1024
	}
	return numericalValue
}

async function tryRead(filePath){
	try{
		return (await fs.promises.readFile(filePath)).toString()
	}catch(e){
		return undefined
	}
}
async function tryReadInt(filePath){
	var value = await tryRead(filePath)
	if(value){
		return parseInt(value)
	}else{
		return undefined
	}
}

async function tryReadDir(filePath){
	try{
		return (await fs.promises.readdir(filePath))
	}catch(e){
		return []
	}
}

module.exports = class LinuxGPU{
	loggedError = false
	lastData = {}
	
	
	async getDeviceInfo(){
		var devices = []
		try{
			var devDir = "/sys/class/drm/"
			var gpuNamesAll = await fs.promises.readdir(devDir)
			for(var x in gpuNamesAll){
				var name = gpuNamesAll[x]
				if(!/card\d$/.test(name)){
					continue
				}
				// console.log("Name: " + name)
				var fullPath = await fs.promises.realpath(path.join(devDir,name,'device'))
				var enabled = await tryReadInt(path.join(fullPath,"enable"))
				// console.log(name + " enabled: " + enabled)
				if(enabled == 1){
					console.log("loop started")
					var deviceID = await tryRead(path.join(fullPath,"device"))
					var deviceName = undefined
					if(deviceID){
						deviceName = gpuIDTable["0xp" + deviceID.substring(2).toUpperCase().trim()]?.["Graphics card"]
					}
					
					var driverPath = await fs.promises.realpath(path.join(fullPath,'driver'))
					var driverName = driverPath.substring(driverPath.lastIndexOf("/") + 1)
					if(deviceName){
						name = deviceName
					} else if(driverName) {
						name = driverName
					}

					var device = {}
	
					device.core = {}
					device.core.usage = await tryReadInt(path.join(fullPath,"gpu_busy_percent"))
					
					device.name = name
					
					device.memory = {}
					device.memory.bytes = parseUnit(await tryReadInt(path.join(fullPath,"mem_info_vram_used")))
					device.memory.bytes_total = parseUnit(await tryReadInt(path.join(fullPath,"mem_info_vram_total")))
					device.memory.usage = device.memory.bytes / device.memory.bytes_total * 100
					if(!isFinite(device.memory.bytes)){
						delete device.memory
					}
					
					var hwmonDir = (await tryReadDir(path.join(fullPath, "hwmon")))[0]
					if(hwmonDir){
						device.power = {}
						var powerUsed = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "power1_average"))
						if(powerUsed != undefined){
							device.power.watts = (powerUsed / 1000000)
						}
						var powerTotal = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "power1_cap"))
						if(powerTotal != undefined){
							device.power.watts_limit = (powerTotal / 1000000)
						}
						device.power.usage = device.power.watts / device.power.watts_limit * 100
						if(!isFinite(device.power.watts)){
							delete device.power
						}

						var fanMax = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "fan1_max"))
						var fanTarget = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "fan1_target"))
						if(fanTarget != undefined && fanMax != undefined){
							device.fan_speed = fanTarget / fanMax
						}
						
						var gpuTemp = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "temp1_input"))
						if(gpuTemp != undefined){
							device.temperature = gpuTemp / 1000
						}
					}
					
					device.bus = {}
					device.bus.type = "pcie"
					// tx is likely GPU->CPU and rx is likely CPU->GPU
					// device.bus.tx_bytes = parseUnit(gpu["pcie.tx_util"])
					// device.bus.rx_bytes = parseUnit(gpu["pcie.rx_util"])
					var pcieSpeedCurrent = await tryRead(path.join(fullPath,"current_link_speed"))
					device.bus.width = await tryReadInt(path.join(fullPath,"current_link_width"))
					var pcieSpeedMax = await tryRead(path.join(fullPath,"max_link_speed"))
					device.bus.width_max = await tryReadInt(path.join(fullPath,"max_link_width"))
					if(pcieSpeedCurrent != undefined && device.bus.width != undefined){
						device.bus.generation = pcieGenLookup[device.bus.width][pcieSpeedCurrent?.split(' ').at(0)]
					}
					if(pcieSpeedMax != undefined && device.bus.width_max != undefined){
						device.bus.generation_max = pcieGenLookup[device.bus.width_max][pcieSpeedMax?.split(' ').at(0)]
					}
					
					if(!device.bus.generation && device.bus.tx_bytes == undefined){
						delete device.bus
					}
					
					devices.push(device)
				}
			}
		}catch(err){
			if(process.env.VERBOSE && !this.loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not get GPU info from /sys/class/drm.")
			}
		}
		return devices
	}
}