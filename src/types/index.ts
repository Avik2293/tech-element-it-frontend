
export interface Product {
    id: string;
    name: string;
    size: string;
    color: string | null;
    availableStock: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
    discount: number;
    discountPrice: number;
}

export interface PaymentMethod {
    id: string;
    accountName: string;
    accountType: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    status: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;

    // accountHolderName
    // :
    // "Anamul Hassan"
    // branchId
    // :
    // 3
    // currentBalance
    // :
    // 370050
    // id
    // :
    // 2
    // openingBalance
    // :
    // 10
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string | null;
    phone: string;
    role: string;
    avatar: string;
    branch: number;
    branchInfo: {
        id: number;
        branchName: string;
        branchLocation: string;
        due: number;
        address: string;
        phone: string;
        hotline: string;
        email: string;
        openHours: null;
        closingHours: null;
        isAdjustment: boolean;
        type: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;



    //     active: true;
    //     bloodGroup: null
    //     branchId
    //     :
    //     3
    //     comingByBus
    //     :
    //     false

    //     currentAddress
    //     :
    //     null
    //     dateOfBirth
    //     :
    //     null
    //     designationId
    //     :
    //     1



    //     employeeDesignation
    //     :
    //     createdAt
    // :
    //     "2024-12-06T07:43:55.211Z"
    //     designation
    //     :
    //     "Salesman"
    //     id
    //     :
    //     1




    //     fatherName
    //     :
    //     null
    //     fatherPhone
    //     :
    //     null

    //     gender
    //     :
    //     null
    //     graduation
    //     :
    //     "Hsc"

    //     idNumber
    //     :
    //     "10001"
    //     joiningDate
    //     :
    //     "2024-11-30T18:00:00.000Z"
    //     maritalStatus
    //     :
    //     null
    //     motherName
    //     :
    //     null
    //     motherPhone
    //     :
    //     null
    //     name
    //     :
    //     " undefined"
    //     nid
    //     :
    //     "1212123123123"
    //     passport
    //     :
    //     "123123123"
    //     permanentAddress
    //     :
    //     null

    //     referenceName
    //     :
    //     null
    //     referencePhone
    //     :
    //     null

}