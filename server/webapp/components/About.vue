<template>
	<div style="margin:3em">
		<h2>About the System Monitor:</h2>
		<p>The System Monitor is a web-based client-server system monitoring software created by Robley, Quinten &amp; Schlick, Jordan using a mixture of CSS, HTML, Javascript, Node.js, and Vue.</p>
		<h2>How to use the System Monitor:</h2>
		<p><strong>The Home Page:</strong></p>
		<p>Displays a whole network overview and an overview of the connected nodes.</p>
		<ul>
		<li>Clicking on the whole network overview will take you to a page that has a more detailed overview of the average statistics of all the nodes on the network (See Network Average Page for more details).&nbsp;</li>
		<li>Clicking on any of the connected node overviews takes you to a more detailed breakdown of the node's performance (See Node Pages for more details).</li>
		</ul>
		<p><strong>Node Pages:</strong></p>
		<p>Displays a larger version of the node overview that is on the home page as well as a breakdown of the CPU, GPU, and Network statistics. For each GPU connected to the node, a different breakdown box will appear. If a system does not have a GPU or a Network interface, the respective overview will not be displayed.</p>
		<ul>
		<li>The CPU:</li>
		<ul>
		<li>Displays a heatmap of all the core's usage (By heatmap we mean that based on the core's usage the color becomes more opaque).</li>
		<li>If the system supports it and the client software has permission to do so, the temperature and power draw of the CPU will be displayed below the core heatmap.</li>
		</ul>
		<li>The GPU:</li>
		<ul>
		<li>Displays the overall GPU utilization, memory (VRAM), and power draw.</li>
		<li>If the system supports it, the temperature, fan speed, and bus statistics will be displayed.</li>
		</ul>
		<li>The Network Interface:</li>
		<li>Displays any network interface connected to the system as well as the send and receive data rates.</li>
		<li>Note: If a virtual network interface is attached to the system it will also be displayed</li>
		</ul>
		<p><strong>Network Average Page:</strong></p>
		<p>Displays the network average overview that is on the home page as well as a breakdown of the average CPU and GPU statistics. For each GPU connected to the node, a different breakdown box will appear. If no system on the network has a GPU the GPU overview will not be displayed.</p>
		<ul>
		<li>The CPU:</li>
		<ul>
		<li>Displays a heatmap of the network's average core usage where the number of cores displayed is the same as the node with the most cores (By heatmap we mean that based on the core's usage the color becomes more opaque).</li>
		<li>If the system supports it and the client software has permission to do so, the temperature and power draw of the CPU will be displayed below the core heatmap.</li>
		</ul>
		<li>The GPU:</li>
		<ul>
		<li>Displays the overall GPU utilization, memory (VRAM), and power draw.</li>
		<li>If the system supports it, the temperature, fan speed, and bus statistics will be displayed.</li>
		</ul>
		</ul>
		<p><strong>Settings Page:</strong></p>
		<p>Gives all the settings a user can change. The web dashboard will update every time a setting is changed.</p>
		<p><strong>Search Bar:</strong></p>
		<p>The search bar has an autocomplete feature and will display up to 4 suggestions. The arrow keys can be used to navigate the autocomplete dropdown and enter will submit the search request.</p>
		<h2>How the System Monitor Woks:</h2>
		<p>It has two main parts. There are clients that are run on each node. There is a central server where all of the client nodes and users connect to its web interface. The nodes will automatically try to reconnect so restarting the server does not require restarting all of the node clients. Both the user interface and the websockets for the node clients run through the same port on the server. WebSockets are used to transfer data in real-time from the clients to the user interface. Information is sent approximately once every second but is varied by a few ms on every connection to prevent bursts of traffic.</p>
		<p><strong>Security:</strong></p>
		<p>The system is designed to have a minimal attack surface. Most of the data is fed from the client nodes to the user interface without the intervention of the user interface. The user does not need to make requests for data. This makes it so there are very few actions that can be taken from the public-facing connection. The server can also require a password for client nodes to connect, which prevents people from connecting to their own clients. Although from a security standpoint people connecting their own clients has little effect. The clients can run with or without root privileges. When run with root privileges access to some data such as CPU power can be accessed but most data is accessible without root. The clients only connect and push data to the server so they have very little attack surface. As long as the directory they are in and the path can not be modified, the clients can not be used for privilege escalation if they are running as root. The server does not require root privileges.</p>
		<h2>Why the System Monitor was Created:</h2>
		<p>When running projects on Rosie it is complicated to view the current usage of resources. Usage is an important metric to see if there are bottlenecks or improvements to be had. The current way to find out usage is to open multiple terminals and use nvidia-smi, htop, and other similar programs. The user interface provides all of the info in one place in the browser.&nbsp; It has already been used to tune some multi-GPU code with an input pipeline. On the left is an example of the system monitor showing full utilization of a node on ROSIE. Designing projects to take full use of the hardware available allows for faster prototyping and decreases the time that hardware sits idling. It can also show when there is not enough hardware allocated to a task. It is easy to see if memory or processor limits have been reached.</p>
	</div>
</template>

<script>

export default{
	props:{
		info:{
			type:Object,
			default:{}
		},
	},
	data() {
		return {
			totalDataString:0,
			totalDataBuffer:0,
		}
	},
	mounted() {
		
	},
	methods: {
		
	},
	computed:{
		
	},
	components:{

	},
}
</script>