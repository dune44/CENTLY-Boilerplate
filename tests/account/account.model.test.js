const accountModel = require('../../controllers/account.model');


const testUser = () => {
    return {
        "_id": "6f1395e5-ce24-41d7-8c07-34b56941a428",
        "username": "testuser",
        "password":"1A2b6O!b",
        "email": "dune44@hotmail.com"
    };
}

describe('Account Model', () => {
    describe('Create', () => {
        
        describe('Create a user account.', () => {
            accountModel.Create.account(testUser, (r) => {
                it('should not return false', () => {
                    expect(r).to.not.equal(false);
                });
                it('should have property username', () => {
                    expect(r).to.have.property('username');
                });
                it('should have property password', () => {
                    expect(r).to.have.property('password');
                });
                it('should have property email', () => {
                    expect(r).to.have.property('email');
                });
                it('should have a username longer than 30', () => {
                    expect(r.password).to.have.lengthOf.at.least(30);
                });
            });
        });

    });
    describe('Read', () => {
        
        describe('findOne', () => {
        });

        describe('Validate Credentials', () => {
        });

    });
    describe('Update', () => {
    
        

    });
    describe('Delete', () => {
    
        
        
    });
});
