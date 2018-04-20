# Platform for building and testing artificial neural networks

Web-based platform for building, testing, and analyzing results of artificial neural networks for machine learning projects

## Overview

The system provides a complete platform for building and testing artificial neural networks, without the need to write any code. The only requirement is for the user to understand the data and network models conceptually.  The system builds an abstract specification for training and testing an artificial neural network, and then executed the specification using Keras, Scikit-learn and TensorFlow. As the user further interacts with the interface and tunes hyperparameters and network structure, the accuracy of the model changes. The system keeps track of the accuracy at each evaluation point and displays the statistics graphically.

## Built with

- Keras
- TensorFlow
- Scikit-learn
- Node.js + Angular2 + TypeScript (https://github.com/vladotesanovic/angular2-express-starter)
- MongoDB

## Install / Development

```bash
git clone https://github.com/harymitchell/mscs-ml
cd mscs-ml

# Install dependencies
npm install

# start dev server
npm run-script start_dev

# Client url: http://localhost:4200
# Application ( epxress ) API: http://localhost:4300
```

## Learn More

- White Paper and presentation: https://drive.google.com/drive/folders/1TzlAKAXlLQD2igVTPDif-F1RCpVbkfMg?usp=sharing
