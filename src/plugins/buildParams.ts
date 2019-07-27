function buildParams (validParams : string[], body : any) : any{
    let params : any = {};
            
    validParams.forEach(attr => {
        if(Object.prototype.hasOwnProperty.call(body,attr))
            params[attr] = body[attr];
    })

    return params;
}

export default buildParams;