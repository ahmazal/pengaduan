const response = (statusCode, data, message, res) => {
    const success = statusCode >= 200 && statusCode < 300;
    res.status(statusCode).json({
        success,
        payload: data,
        message,
        metaData: {
            prev: '',
            next: '',
            current: ''
        }
    })
}

module.exports = response