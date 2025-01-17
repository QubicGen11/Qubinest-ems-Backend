const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const employeeLeaveRequest=async(req,res)=>{
    const{companyEmail,leaveType,department,startDate,endDate,duration,reason,leaveDocument}=req.body
    try {
        const isUser=await prisma.user.findUnique({
            where:{
                email:companyEmail
            }
        })
        if(!isUser){
            return res.status(400).send('user is not found please register or login')
        }
        const newLeaveRequest=await prisma.leaveRequests.create({
            data:{
                employee_id:isUser.employeeId,
                companyEmail:isUser.email,
                department:department,
                leaveType:leaveType,
                startDate:startDate,
                endDate:endDate,
                duration:duration,
                reason:reason,
                status:'pending',
                leaveDocument:leaveDocument
            }
        })
        return res.status(200).json({message:"leaver request submitted",
        leaveRequest:newLeaveRequest
    })
    } catch (error) {
        return res.status(500).send('internal server error'+error.message)
    }
}
const allLeaveRequests=async(req,res)=>{
    try {
        const allLeaveRequest=await prisma.leaveRequests.findMany({})
        return res.status(200).send(allLeaveRequest)
    } catch (error) {
        return res.status(200).send('internal error'+error.message)

    }
}
const leaveRequestByDepartment=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}
const approveLeaveRequests = async (req, res) => {
    const { companyEmail, employeeEmail, leaveId } = req.body;
    console.log('Approve request received:', { companyEmail, employeeEmail, leaveId });

    try {
        // Verify admin/manager status
        const isAdmin = await prisma.user.findFirst({
            where: {
                email: companyEmail,
                OR: [
                    { role: 'Manager' },
                    { role: 'Admin' }
                ]
            }
        });

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Only managers or admins can approve leaves'
            });
        }

        // Update the leave request - Fixed the update query
        const updatedLeave = await prisma.leaveRequests.update({
            where: {
                leave_id: leaveId  // Make sure this matches your schema
            },
            data: {
                status: 'Approved'  // Consistent status string
            }
        });

        console.log('Updated leave:', updatedLeave); // Debug log

        if (!updatedLeave) {
            return res.status(400).json({
                success: false,
                message: 'No leave request found to approve'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Leave request approved successfully',
            data: updatedLeave
        });
    } catch (error) {
        console.error('Error in approveLeaveRequests:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const declineLeaveRequests = async (req, res) => {
    const { companyEmail, employeeEmail, leaveId } = req.body;
    console.log('Decline request received:', { companyEmail, employeeEmail, leaveId });

    try {
        // Verify admin/manager status
        const isAdmin = await prisma.user.findFirst({
            where: {
                email: companyEmail,
                OR: [
                    { role: 'Manager' },
                    { role: 'Admin' }
                ]
            }
        });

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Only managers or admins can decline leaves'
            });
        }

        // Update the leave request - Fixed the update query
        const updatedLeave = await prisma.leaveRequests.update({
            where: {
                leave_id: leaveId  // Make sure this matches your schema
            },
            data: {
                status: 'Rejected'  // Consistent status string
            }
        });

        console.log('Updated leave:', updatedLeave); // Debug log

        if (!updatedLeave) {
            return res.status(400).json({
                success: false,
                message: 'No leave request found to decline'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Leave request declined successfully',
            data: updatedLeave
        });
    } catch (error) {
        console.error('Error in declineLeaveRequests:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
// const updateEmployeeLeaveBalance = async (req, res) => {
//     const { employeeEmail } = req.body;

//     try {
//         // Find the employee and their leave balance by email
//         const employee = await prisma.employee.findFirst({
//             where: {
//                 companyEmail: employeeEmail
//             },
//             include: {
//                 leaveBalance: true
//             }
//         });

//         if (!employee) {
//             return res.status(404).send('Employee not found');
//         }

//         // Fetch all leave requests for the employee in a single query
//         const leaveRequests = await prisma.leaveRequests.findMany({
//             where: {
//                 employee_id: employee.employee_id
//             },
//             select: {
//                 duration: true,
//                 status: true
//             }
//         });

//         if (!leaveRequests.length) {
//             return res.status(404).send('No leave requests found for this employee');
//         }

//         // Calculate the number of each type of leave
//         const leaveCounts = leaveRequests.reduce(
//             (counts, request) => {
//                 if (request.status === 'Approved') {
//                     counts.acceptedLeaves += request.duration || 0;
//                 } else if (request.status === 'Rejected') {
//                     counts.rejectedLeaves += request.duration || 0;
//                 } else if (request.status === 'Expired') {
//                     counts.expiredLeaves += request.duration || 0;
//                 }
//                 return counts;
//             },
//             { acceptedLeaves: 0, rejectedLeaves: 0, expiredLeaves: 0 }
//         );

//         // Fetch the leave balance for the employee
//         const leaveBalance = employee.leaveBalance;

//         if (!leaveBalance) {
//             return res.status(404).send('Leave balance not found for this employee');
//         }

//         // Calculate the new total leaves
//         const newTotalLeaves = leaveBalance.totalLeaves - leaveCounts.acceptedLeaves;

//         // Update the leave balance
//         await prisma.leaveBalance.update({
//             where: {
//                 employee_id: employee.employee_id
//             },
//             data: {
//                 acceptedLeaves: leaveBalance.acceptedLeaves + leaveCounts.acceptedLeaves,
//                 rejectedLeaves: leaveBalance.rejectedLeaves + leaveCounts.rejectedLeaves,
//                 expiredLeaves: leaveBalance.expiredLeaves + leaveCounts.expiredLeaves,
//                 totalLeaves: newTotalLeaves
//             }
//         });

//         return res.status(200).send(`Leave balance updated for ${employeeEmail}`);
//     } catch (error) {
//         console.error('Internal error:', error);
//         return res.status(500).send('Internal error: ' + error.message);
//     }
// };



const createNewHoliday=async(req,res)=>{
    const {employeeEmail,LeaveName,LeaveType,LeaveUnit,Note}=req.body
try {
    const isUser=await prisma.user.findFirst({
        where:{
            email:employeeEmail
        }
    })
    const newHoliday=await prisma.leaveType.create({
        data:{
            LeaveName:LeaveName,
            Type:LeaveType,
            LeaveUnit:LeaveUnit,
            Status:'Active',
            Note:Note
        }
    })
    return res.status(200).send(newHoliday)
} catch (error) {
    return res.status(200).send('internal error'+error.message)
}
}
const deleteHoliday = async (req, res) => {
    const { holidayName } = req.params;
    try {
        const findHoliday=await prisma.leaveType.findFirst({
            where:{
                LeaveName:holidayName
            }
        })
        const deleteHoliday = await prisma.leaveType.delete({
            where: {
                id:findHoliday.id
            }
        });
        return res.status(200).send('Holiday deleted');
    } catch (error) {
        return res.status(500).send('Internal error: ' + error.message);
    }
};

const allHolidays=async(req,res)=>{
    try {
        const allHolidays=await prisma.leaveType.findMany({})
        return res.status(200).send(allHolidays)
    } catch (error) {
        return res.status(500).send('Internal error: ' + error.message);
    }
}

const leaveRequestByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const leaveRequests = await prisma.leaveRequests.findMany({
            where: {
                companyEmail: email
            }
        });

        if (!leaveRequests.length) {
            return res.status(404).json({ message: 'No leave requests found for this email' });
        }

        return res.status(200).json(leaveRequests);
    } catch (error) {
        console.error('Error fetching leave requests by email:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports={employeeLeaveRequest,allLeaveRequests,approveLeaveRequests,declineLeaveRequests,createNewHoliday,deleteHoliday,allHolidays,leaveRequestByEmail}