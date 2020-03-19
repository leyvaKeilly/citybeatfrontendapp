export const getAccuracy = function (net, testData) {
    let hits = 0;
    testData.forEach((datapoint) => {
        const output = net.run(datapoint.input);
        if (Math.round(output[0]) == datapoint.output) {
            hits += 1;
        }
    });
    return hits / testData.length;
}

export const shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

export const buildANetwork = function (act, hidLay, nodesPerLay, iter, lrnRat, DATA, numRows, inputColNames, outputColName) {
    const SPLIT = Math.round(numRows * .66);

    DATA = shuffle(DATA);
    const trainData = DATA.slice(0, SPLIT);
    const testData = DATA.slice(SPLIT + 1);

    let myArr = []
    for (let i = hidLay; i > 0; i--) {
        myArr.push(nodesPerLay);
    }

    const config = {
        activation: act,  //Sets the function for activation
        hiddenLayers: myArr,  //Sets the number of hidden layers
        iterations: iter, //The number of runs before  the neural net and then stop training
        learningRate: lrnRat //The multiplier for the backpropagation changes
    }
    const network = new brain.NeuralNetwork(config);

    network.train(trainData);

    const accuracy = getAccuracy(network, testData); //0
    /*
    while (accuracy <= 0 ){
        let a = getAccuracy(network, testData);
        if (a > 0) {
            accuracy = a;
        };
    }
    */
    return {
        acc: accuracy,
        net: network,
        inputs: inputColNames,
        outputs: outputColName,

        data: DATA,
        settings: {
            activation: act,
            hiddenLayers: myArr,
            iterations: iter,
            learningRate: lrnRat
        }
    }
}

export const netFromJson = function (myJson) {
    const net = new brain.NeuralNetwork();
    return net.fromJSON(myJson);
}

export const netToJson = function (myNet) {
    return brain.myNet.toJSON();
}

