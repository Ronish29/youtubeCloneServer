exports.testRoute= async (req,res) => {
    return res.status(200).json({
        success:true,
        message: "Test route successfully worked"
    });
}

