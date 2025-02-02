const asyncHandler = (requesthandler) => {
    return(req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next))
        .catch((err) =>{
            next(err);
        })
    }
}

export {asyncHandler}




/*
const asyncHandler = (fn)=> async(req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            massage: error.massage
        })
    }
}

*/