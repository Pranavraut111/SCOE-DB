from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.crud.base import CRUDBase
from app.models.subject import Subject, SubjectCatalog, SubjectComponent, Department, Semester
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectComponentCreate

class CRUDSubject(CRUDBase[Subject, SubjectCreate, SubjectUpdate]):
    def create_with_components(
        self, db: Session, *, obj_in: SubjectCreate
    ) -> Subject:
        # Create subject
        obj_in_data = obj_in.dict(exclude={"components"})
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # Create components
        for component_data in obj_in.components:
            component = SubjectComponent(
                subject_id=db_obj.id,
                **component_data.dict()
            )
            db.add(component)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_year_dept_sem(
        self, db: Session, *, year: str, department: Department, semester: Semester
    ) -> List[Subject]:
        return db.query(self.model).filter(
            and_(
                self.model.year == year,
                self.model.department == department,
                self.model.semester == semester
            )
        ).all()
    
    def get_by_code_and_year(
        self, db: Session, *, subject_code: str, year: str
    ) -> Optional[Subject]:
        return db.query(self.model).filter(
            and_(
                self.model.subject_code == subject_code,
                self.model.year == year
            )
        ).first()

class CRUDSubjectCatalog(CRUDBase[SubjectCatalog, dict, dict]):
    def get_by_dept_and_sem(
        self, db: Session, *, department: Department, semester: Semester
    ) -> List[SubjectCatalog]:
        return db.query(self.model).filter(
            and_(
                self.model.department == department,
                self.model.semester == semester
            )
        ).all()
    
    def get_by_department(
        self, db: Session, *, department: Department
    ) -> List[SubjectCatalog]:
        return db.query(self.model).filter(
            self.model.department == department
        ).order_by(self.model.semester, self.model.subject_name).all()

class CRUDSubjectComponent(CRUDBase[SubjectComponent, SubjectComponentCreate, dict]):
    def get_by_subject_id(
        self, db: Session, *, subject_id: int
    ) -> List[SubjectComponent]:
        return db.query(self.model).filter(
            self.model.subject_id == subject_id
        ).all()

subject = CRUDSubject(Subject)
subject_catalog = CRUDSubjectCatalog(SubjectCatalog)
subject_component = CRUDSubjectComponent(SubjectComponent)
