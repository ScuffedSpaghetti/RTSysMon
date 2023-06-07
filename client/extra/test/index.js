//@ts-check


/*

	Config

Example local.yaml section for one device:
#=====================
extraDevices:
  - type: "test"
    value: 100
#=====================
	
Example local.yaml section for two devices:
#=====================
extraDevices:
  - type: "test"
    value: 100
  - type: "test"
    value: 50
#=====================


*/



module.exports = class ExtraTestDevice{
	constructor(configOptions){
		this.testValue = configOptions.value || 0
	}
	
	valueText = ["This", "Is", "A", "Test"]
	valueTextLocation = -1
	
	async getDeviceInfo(){
		return [
			{
				title: "Test",
				description: "This is a test device using the extra device api.",
				status: "Working",
				usage: Math.random() * 100,
				power:{
					usage: 100,
					watts: 15000,
					watts_limit: 15000
				},
				outline:{
					r: Math.floor(Math.random() * 256),
					g: Math.floor(Math.random() * 256),
					b: Math.floor(Math.random() * 256),
					overview: 1
				},
				values:{
					// values should have unique keys to prevent averaging unrelated values
					value_donut: {
						type: "donut",
						title: "Config Value",
						usage: this.testValue,
						// take the minimum when combining this value instead of the average
						// any numerical key can be modified in this way
						usage_reduce_add: 1, 
					},
					custom_donut: {
						type: "donut",
						title: "Custom Donut",
						usage: Math.random() * 200,
					},
					custom_donut_dual: {
						type: "donut_dual",
						title: "Custom Dual Donut",
						usage_inner: Math.random() * 110,
						usage_inner_reduce_max: 1, // take the maximum when combining this value instead of the average
						usage_outer: Math.random() * 110,
						usage_outer_reduce_min: 1, // take the minimum when combining this value instead of the average
					},
					example_bar: {
						type: "bar",
						title: "Custom Bar",
						usage: Math.random() * 200,
						value: 10,
						value_limit: 10,
						unit: "Units",
					},
					example_opacity: {
						type: "opacity",
						title: "Custom Opacity",
						usage: Math.random() * 200,
					},
					custom_value: {
						type: "value",
						title: "Custom Value",
						value: this.valueText[this.valueTextLocation = (this.valueTextLocation + 1) % this.valueText.length],
						unit: "!",
					},
					custom_time: {
						type: "value",
						title: "Custom Time",
						value: 10000 * Math.random(),
						unit: "time",
					},
					custom_date: {
						type: "value",
						title: "Custom Date",
						value: Date.now() / 1000 + 200000 * Math.random() + (Math.random() < 0.25 ? 100000000 * (Math.random() - 0.5) : 0),
						unit: "date",
					},
				},
				values_overview:{
					test_overview: {
						type: "donut",
						title: "Test",
						usage: this.testValue || Math.random() * 200,
					},
				}
			}
		]
	}
}