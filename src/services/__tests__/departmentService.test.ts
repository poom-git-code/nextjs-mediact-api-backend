import { getDepartment } from '../departmentService';

describe('Department Service', () => {
    test('should return department details', () => {
        const department = getDepartment(1);
        expect(department).toEqual({ id: 1, name: 'HR' });
    });
    
    test('should return null for non-existing department', () => {
        const department = getDepartment(999);
        expect(department).toBeNull();
    });
});