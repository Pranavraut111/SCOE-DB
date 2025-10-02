from pydantic import BaseModel
from typing import List, Optional
from app.models.subject import Department, Semester, ComponentType

# Subject Catalog Schemas
class SubjectCatalogBase(BaseModel):
    department: Department
    semester: Semester
    subject_code: str
    subject_name: str
    default_credits: int = 3

class SubjectCatalogCreate(SubjectCatalogBase):
    pass

class SubjectCatalog(SubjectCatalogBase):
    id: int
    
    class Config:
        from_attributes = True

# Subject Component Schemas
class SubjectComponentBase(BaseModel):
    component_type: ComponentType
    is_enabled: bool = True
    out_of_marks: int
    passing_marks: int
    resolution: Optional[str] = None

class SubjectComponentCreate(SubjectComponentBase):
    pass

class SubjectComponentUpdate(BaseModel):
    component_type: Optional[ComponentType] = None
    is_enabled: Optional[bool] = None
    out_of_marks: Optional[int] = None
    passing_marks: Optional[int] = None
    resolution: Optional[str] = None

class SubjectComponent(SubjectComponentBase):
    id: int
    subject_id: int
    
    class Config:
        from_attributes = True

# Subject Schemas
class SubjectBase(BaseModel):
    year: str
    scheme: str
    department: Department
    semester: Semester
    subject_code: str
    subject_name: str
    credits: int
    overall_passing_criteria: float = 40.0

class SubjectCreate(SubjectBase):
    components: List[SubjectComponentCreate] = []

class SubjectUpdate(BaseModel):
    year: Optional[str] = None
    scheme: Optional[str] = None
    department: Optional[Department] = None
    semester: Optional[Semester] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    credits: Optional[int] = None
    overall_passing_criteria: Optional[float] = None

class Subject(SubjectBase):
    id: int
    components: List[SubjectComponent] = []
    
    class Config:
        from_attributes = True

# Response Schemas
class SubjectListResponse(BaseModel):
    subjects: List[Subject]
    total: int
    page: int
    per_page: int

class SubjectCatalogListResponse(BaseModel):
    subjects: List[SubjectCatalog]
    department: Department
    semester: Semester
