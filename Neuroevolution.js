/**
*提供一组处理神经进化和神经进化的类和方法
*遗传算法。
* @参数 {选项}  一种用于Neuroevolution选项对象。
*/
var Neuroevolution = function (options) {
	var self = this;

	self.options = {
		/**
		 * *物流激活功能。
         *
         * @param  {a}  输入值。
         * @return Logistic函数输出。
		 */
		activation: function (a) {
			ap = (-a) / 1;
			return (1 / (1 + Math.exp(ap)))
		},

		/**
         *返回介于-1和1之间的随机值。
         * @return随机值。
         */
		randomClamped: function () {
			return Math.random() * 2 - 1;
		},

		// //各种因素和参数（以及默认值）。
		network: [1, [1], 1], // Perceptron网络结构（1隐藏//层）。
// 人数88143577
		population: 50, //世代人口。
		elitism: 0.2, //最好的网络密码保持不变代（率）。
		randomBehaviour: 0.2,//下一代新的随机网络(率)
		mutationRate: 0.1, //突触权重的突变率。
		mutationRange: 0.5, //突变的间隔变化//突触重量。
		historic: 0, // //最新一代保存。
		lowHistoric: false, //仅保存分数（不是网络）。
		scoreSort: -1, //排序顺序（-1 = desc，1 = asc）。
		nbChild: 1 //通过育种的子女数量。
	}

	/**

     *覆盖默认选项。
     *
     * @param  {options}  Neuroevolution选项的对象。
     * @return void
	 */
	self.set = function (options) {
		for (var i in options) {
			if (this.options[i] != undefined) {//仅当在值传递的覆盖//实际上是定义的。
				self.options[i] = options[i];
			}
		}
	}

//使用传入选项覆盖默认选项
	self.set(options);


	/*NEURON**********************************************************************/
    /**
    *人工神经元类
    *
    * @constructor
    */
	var Neuron = function () {
		this.value = 0;
		this.weights = [];
	}

	/**
	 * *将随机钳位值的神经元权重数量初始化。*
	 * @param {nb}  数量的神经元的权重的（输入的数量）。
	 * @return void
	 */
	Neuron.prototype.populate = function (nb) {
		this.weights = [];
		for (var i = 0; i < nb; i++) {
			this.weights.push(self.options.randomClamped());
		}
	}


	/*LAYER***********************************************************************/
	/**
     *神经网络层类。
     *
     * @constructor
     * @param  {index} 网络中此层的索引。
     * /
	 */
	var Layer = function (index) {
		this.id = index || 0;
		this.neurons = [];
	}

	/**
     *使用一组随机加权的神经元填充图层。
     *
     *使用随机钳位的nbInputs输入初始化每个Neuron
     *价值。
     *
     * @param  {nbNeurons} 神经元数量。
     * @param  {nbInputs} 输入数量。
     * @return void
	 */
	Layer.prototype.populate = function (nbNeurons, nbInputs) {
		this.neurons = [];
		for (var i = 0; i < nbNeurons; i++) {
			var n = new Neuron();
			n.populate(nbInputs);
			this.neurons.push(n);
		}
	}


	/*NEURAL NETWORK（神经网络）**************************************************************/
    /**
    *神经网络课程
    *
    *由神经元层组成。
*
* @constructor
*/
	var Network = function () {
		this.layers = [];
	}

	/**
     *生成网络图层。
     * @param  {input} 输入层中的神经元数量。
     * @param  {hidden} 每个隐藏层的神经元数量。
     * @param  {output} 输出层中的神经元数量。
     * @return void
	 */
	Network.prototype.perceptronGeneration = function (input, hiddens, output) {
		var index = 0;
		var previousNeurons = 0;
		var layer = new Layer(index);
		layer.populate(input, previousNeurons); // Number of Inputs will be set to
		// 0 since it is an input layer.
		previousNeurons = input; // number of input is size of previous layer.
		this.layers.push(layer);
		index++;
		for (var i in hiddens) {
			// Repeat same process as first layer for each hidden layer.
			var layer = new Layer(index);
			layer.populate(hiddens[i], previousNeurons);
			previousNeurons = hiddens[i];
			this.layers.push(layer);
			index++;
		}
		var layer = new Layer(index);
		layer.populate(output, previousNeurons); // Number of input is equal to
		// the size of the last hidden
		// layer.
		this.layers.push(layer);
	}

	/**
     *创建网络副本（神经元和权重）。
     *返回每层神经元的数量和所有权重的平面数组。
     * @return网络数据。
	 */
	Network.prototype.getSave = function () {
		var datas = {
			neurons: [], // Number of Neurons per layer.
			weights: [] // Weights of each Neuron's inputs.
		};

		for (var i in this.layers) {
			datas.neurons.push(this.layers[i].neurons.length);
			for (var j in this.layers[i].neurons) {
				for (var k in this.layers[i].neurons[j].weights) {
					// push all input weights of each Neuron of each Layer into a flat
					// array.
					datas.weights.push(this.layers[i].neurons[j].weights[k]);
				}
			}
		}
		return datas;
	}

	/**
     *应用网络数据（神经元和权重）。
     * @param  {save} 网络数据的复制（神经元和权重）。
     * @return void
	 */
	Network.prototype.setSave = function (save) {
		var previousNeurons = 0;
		var index = 0;
		var indexWeights = 0;
		this.layers = [];
		for (var i in save.neurons) {
			// Create and populate layers.
			var layer = new Layer(index);
			layer.populate(save.neurons[i], previousNeurons);
			for (var j in layer.neurons) {
				for (var k in layer.neurons[j].weights) {
					// Apply neurons weights to each Neuron.
					layer.neurons[j].weights[k] = save.weights[indexWeights];

					indexWeights++; // Increment index of flat array.
				}
			}
			previousNeurons = save.neurons[i];
			index++;
			this.layers.push(layer);
		}
	}

	/**
     *计算输入的输出。
     * @param  {inputs}输入 集。
     * @return网络输出。
	 */
	Network.prototype.compute = function (inputs) {
		// Set the value of each Neuron in the input layer.
		for (var i in inputs) {
			if (this.layers[0] && this.layers[0].neurons[i]) {
				this.layers[0].neurons[i].value = inputs[i];
			}
		}

		var prevLayer = this.layers[0]; // Previous layer is input layer.
		for (var i = 1; i < this.layers.length; i++) {
			for (var j in this.layers[i].neurons) {
				// For each Neuron in each layer.
				var sum = 0;
				for (var k in prevLayer.neurons) {
					// Every Neuron in the previous layer is an input to each Neuron in
					// the next layer.
					sum += prevLayer.neurons[k].value *
						this.layers[i].neurons[j].weights[k];
				}

				// Compute the activation of the Neuron.
				this.layers[i].neurons[j].value = self.options.activation(sum);
			}
			prevLayer = this.layers[i];
		}

		// All outputs of the Network.
		var out = [];
		var lastLayer = this.layers[this.layers.length - 1];
		for (var i in lastLayer.neurons) {
			out.push(lastLayer.neurons[i].value);
		}
		return out;
	}


	/*GENOME**********************************************************************/
	/**
     *基因组课程。
     *由分数和神经网络组成。
     * @constructor
     *
     * @param  {score}
     * @param  {network}
	 */
	var Genome = function (score, network) {
		this.score = score || 0;
		this.network = network || null;
	}


	/*GENERATION（世代）******************************************************************/
	/**
     *世代课。
     *
     *由一组基因组组成。
     *
     * @constructor
	 */
	var Generation = function () {
		this.genomes = [];
	}

	/**
     *为这一代添加基因组。
     *
     * @param  {genome}  基因组添加。
     * @return void。
	 */
	Generation.prototype.addGenome = function (genome) {
		for (var i = 0; i < this.genomes.length; i++) {
			if (self.options.scoreSort < 0) {
				if (genome.score > this.genomes[i].score) {
					break;
				}
			} else {
				if (genome.score < this.genomes[i].score) {
					break;
				}
			}

		}
		this.genomes.splice(i, 0, genome);
	}

	/**
     *培育基因组以产生后代。
     * @param  {g1}  基因组 1。
     * @param  {g2}  基因组 2。
     * @param  {} nbChilds  数量的后代（子女）。
	 */
	Generation.prototype.breed = function (g1, g2, nbChilds) {
		var datas = [];
		for (var nb = 0; nb < nbChilds; nb++) {
			var data = JSON.parse(JSON.stringify(g1));
			for (var i in g2.network.weights) {

				if (Math.random() <= 0.5) {
					data.network.weights[i] = g2.network.weights[i];
				}
			}

			// Perform mutation on some weights.
			for (var i in data.network.weights) {
				if (Math.random() <= self.options.mutationRate) {
					data.network.weights[i] += Math.random() *
						self.options.mutationRange *
						2 -
						self.options.mutationRange;
				}
			}
			datas.push(data);
		}

		return datas;
	}

	/**
     *生成下一代。
     * @return下一代数据阵列。
	 */
	Generation.prototype.generateNextGeneration = function () {
		var nexts = [];

		for (var i = 0; i < Math.round(self.options.elitism *
				self.options.population); i++) {
			if (nexts.length < self.options.population) {
				nexts.push(JSON.parse(JSON.stringify(this.genomes[i].network)));
			}
		}

		for (var i = 0; i < Math.round(self.options.randomBehaviour *
				self.options.population); i++) {
			var n = JSON.parse(JSON.stringify(this.genomes[0].network));
			for (var k in n.weights) {
				n.weights[k] = self.options.randomClamped();
			}
			if (nexts.length < self.options.population) {
				nexts.push(n);
			}
		}

		var max = 0;
		while (true) {
			for (var i = 0; i < max; i++) {
				var childs = this.breed(this.genomes[i], this.genomes[max],
					(self.options.nbChild > 0 ? self.options.nbChild : 1));
				for (var c in childs) {
					nexts.push(childs[c].network);
					if (nexts.length >= self.options.population) {
						return nexts;
					}
				}
			}
			max++;
			if (max >= this.genomes.length - 1) {
				max = 0;
			}
		}
	}


	/*GENERATIONS（世代）*****************************************************************/
	/**
     *世代课。
     *保持之前的世代和当前世代。
     * @constructor
	 */
	var Generations = function () {
		this.generations = [];
		var currentGeneration = new Generation();
	}

	/**
     *创建第一代。
     * @param  {input}  输入图层。
     * @param  {input}  隐藏层。
     * @param  {output}  输出图层。
     * @return第一代。
	 */
	Generations.prototype.firstGeneration = function (input, hiddens, output) {

		var out = [];
		for (var i = 0; i < self.options.population; i++) {
			// Generate the Network and save it.
			var nn = new Network();
			nn.perceptronGeneration(self.options.network[0],
				self.options.network[1],
				self.options.network[2]);
			out.push(nn.getSave());
		}

		this.generations.push(new Generation());
		return out;
	}

	/**
	 * 创建下一代
	 * @return Next Generation.
	 */
	Generations.prototype.nextGeneration = function () {
		if (this.generations.length == 0) {
			return false;
		}

		var gen = this.generations[this.generations.length - 1]
			.generateNextGeneration();
		this.generations.push(new Generation());
		return gen;
	}

	/**
     *在Generations中添加基因组。
     *
     * @param  {genome}
     * @return如果没有要添加的Generations，则返回 false。
	 */
	Generations.prototype.addGenome = function (genome) {
		if (this.generations.length == 0) return false;

		return this.generations[this.generations.length - 1].addGenome(genome);
	}


	/*SELF************************************************************************/
	self.generations = new Generations();

	/**
     *重置并创建一个新的Generations对象。
     * @return void。
	 */
	self.restart = function () {
		self.generations = new Generations();
	}

	/**
     *创造下一代。
     * @return下一代神经网络阵列。
	 */
	self.nextGeneration = function () {
		var networks = [];

		if (self.generations.generations.length == 0) {
			networks = self.generations.firstGeneration();
		} else {
			networks = self.generations.nextGeneration();
		}

		var nns = [];
		for (var i in networks) {
			var nn = new Network();
			nn.setSave(networks[i]);
			nns.push(nn);
		}

		if (self.options.lowHistoric) {
			if (self.generations.generations.length >= 2) {
				var genomes =
					self.generations
					.generations[self.generations.generations.length - 2]
					.genomes;
				for (var i in genomes) {
					delete genomes[i].network;
				}
			}
		}

		if (self.options.historic != -1) {
			if (self.generations.generations.length > self.options.historic + 1) {
				self.generations.generations.splice(0,
					self.generations.generations.length - (self.options.historic + 1));
			}
		}

		return nns;
	}

	/**
     *添加具有指定神经网络和分数的新基因组。
     * @param  {network}  神经网络。
     * @param  {score}  分数值。
     * @return void。
	 */
	self.networkScore = function (network, score) {
		self.generations.addGenome(new Genome(score, network.getSave()));
	}
}
