const sortObjectDes = (obj) => {
    const keyValueArray = Object.entries(obj);

    keyValueArray.sort((a, b) => b[1] - a[1]);

    return Object.fromEntries(keyValueArray);
}

export default sortObjectDes