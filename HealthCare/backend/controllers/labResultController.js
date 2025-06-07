const LabResult = require('../models/LabResult');
const Patient = require('../models/Patient');
const asyncHandler = require('express-async-handler');

// ✅ Define the function first using const
const getLabResultsForPatient = asyncHandler(async (req, res) => {
    const patientNumericId = req.params.patientId;

    const patient = await Patient.findOne({ patientId: patientNumericId });

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found with the provided numeric ID.');
    }

    const labResults = await LabResult.find({ patient: patient._id }).sort({ createdAt: -1 });

    if (labResults.length === 0) {
        return res.status(200).json({ message: 'No lab results found for this patient.', labResults: [] });
    }

    res.status(200).json({
        message: 'Lab results fetched successfully!',
        labResults: labResults
    });
});

// ✅ Export it properly
module.exports = {
    getLabResultsForPatient,
};
